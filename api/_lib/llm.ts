// Chat providers, tried in order: OpenAI when OPENAI_API_KEY is set, then OpenRouter's
// free models when OPENROUTER_API_KEY is set. Both stream OpenAI-style SSE, so the
// caller parses them the same way.

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface CallOptions {
  json?: boolean; // ask for a JSON object (OpenAI honours it; others are told in the prompt)
  maxTokens?: number;
}

interface Provider {
  name: string;
  model: string;
  call(messages: Message[], options?: CallOptions): Promise<Response>;
}

const OPENROUTER_MODELS = (process.env.OPENROUTER_MODELS ??
  "minimax/minimax-m3.1-flash:free,google/gemma-4-31b-it:free,nvidia/nemotron-3.5-lightning:free")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

// Keys pasted into a dashboard often pick up quotes or whitespace; OpenAI then
// answers 401. Normalise them so a copy-paste slip doesn't silently disable a provider.
const cleanKey = (value: string | undefined) => value?.trim().replace(/^["']|["']$/g, "").trim() || undefined;

// Reasoning models (o-series, gpt-5 and later) reject temperature and spend part of the
// token budget thinking, so they get a low reasoning effort and a roomier limit.
const isReasoningModel = (model: string) => /^(o\d|gpt-[5-9])/.test(model);

function providers(): Provider[] {
  const list: Provider[] = [];
  const openaiKey = cleanKey(process.env.OPENAI_API_KEY);
  if (openaiKey) {
    const model = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";
    list.push({
      name: "openai",
      model,
      call: (messages, options = {}) =>
        fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            messages,
            stream: true,
            max_completion_tokens: options.maxTokens ?? (isReasoningModel(model) ? 1500 : 600),
            ...(isReasoningModel(model) ? { reasoning_effort: "low" } : { temperature: 0.1 }),
            ...(options.json ? { response_format: { type: "json_object" } } : {}),
          }),
        }),
    });
  }
  const openrouterKey = cleanKey(process.env.OPENROUTER_API_KEY);
  if (openrouterKey) {
    list.push({
      name: "openrouter",
      model: OPENROUTER_MODELS[0] ?? "",
      call: (messages, options = {}) =>
        fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openrouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/HaroonRiasat1",
            "X-Title": "Chat with Haroon's resume",
          },
          body: JSON.stringify({
            models: OPENROUTER_MODELS,
            messages,
            stream: true,
            temperature: 0.1,
            // Reasoning models spend part of this budget thinking, so leave plenty of room for the answer.
            max_tokens: options.maxTokens ?? 1200,
            reasoning: { effort: "low", exclude: true },
          }),
        }),
    });
  }
  return list;
}

export const hasProvider = () => providers().length > 0;

export type Completion =
  | { ok: true; body: ReadableStream<Uint8Array>; provider: string; skipped: string }
  | { ok: false; status: number; skipped: string };

// Why each earlier provider was passed over, e.g. "openai:401:invalid_api_key" or
// "openai:not-set". Only names, status and error codes, never keys, so it is safe to
// expose in a header.
function skippedSummary(failed: string[]): string {
  const notSet = process.env.OPENAI_API_KEY ? [] : ["openai:not-set"];
  return [...notSet, ...failed].join(",") || "none";
}

// Returns the first provider's stream that starts successfully. Falls through on
// errors and rate limits, so an OpenAI outage or quota problem still gets an answer.
export async function streamCompletion(messages: Message[], options: CallOptions = {}): Promise<Completion> {
  let status = 502;
  const failed: string[] = [];
  for (const p of providers()) {
    const res = await p.call(messages, options).catch(() => null);
    if (res?.ok && res.body) return { ok: true, body: res.body, provider: `${p.name}/${p.model}`, skipped: skippedSummary(failed) };
    status = res?.status === 429 ? 429 : 502;
    const detail = (await res?.text().catch(() => "")) ?? "";
    const code = /"code":\s*"([a-z_]+)"/.exec(detail)?.[1];
    failed.push(`${p.name}:${res?.status ?? "network"}${code ? `:${code}` : ""}`);
    console.error(`${p.name} error`, res?.status, detail);
  }
  return { ok: false, status, skipped: skippedSummary(failed) };
}

// Collects a streamed completion into one string, for callers that need the whole
// answer before responding (e.g. JSON that must be validated first).
export async function completeText(
  messages: Message[],
  options: CallOptions = {},
): Promise<{ ok: true; text: string; provider: string } | { ok: false; status: number }> {
  const upstream = await streamCompletion(messages, options);
  if (!upstream.ok) return { ok: false, status: upstream.status };
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  for await (const chunk of upstream.body as unknown as AsyncIterable<Uint8Array>) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
      try {
        text += JSON.parse(line.slice(6)).choices?.[0]?.delta?.content ?? "";
      } catch {
        // keep-alive comments and partial lines
      }
    }
  }
  return { ok: true, text, provider: upstream.provider };
}
