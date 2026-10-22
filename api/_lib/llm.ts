// Chat providers, tried in order: OpenAI when OPENAI_API_KEY is set, then OpenRouter's
// free models when OPENROUTER_API_KEY is set. Both stream OpenAI-style SSE, so the
// caller parses them the same way.

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface Provider {
  name: string;
  model: string;
  call(messages: Message[]): Promise<Response>;
}

const OPENROUTER_MODELS = (process.env.OPENROUTER_MODELS ??
  "minimax/minimax-m3.1-flash:free,google/gemma-4-31b-it:free,nvidia/nemotron-3.5-lightning:free")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

// Reasoning models (o-series, gpt-5 and later) reject temperature and spend part of the
// token budget thinking, so they get a low reasoning effort and a roomier limit.
const isReasoningModel = (model: string) => /^(o\d|gpt-[5-9])/.test(model);

function providers(): Provider[] {
  const list: Provider[] = [];
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const model = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";
    list.push({
      name: "openai",
      model,
      call: (messages) =>
        fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            messages,
            stream: true,
            max_completion_tokens: isReasoningModel(model) ? 1500 : 600,
            ...(isReasoningModel(model) ? { reasoning_effort: "low" } : { temperature: 0.1 }),
          }),
        }),
    });
  }
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (openrouterKey) {
    list.push({
      name: "openrouter",
      model: OPENROUTER_MODELS[0] ?? "",
      call: (messages) =>
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
            max_tokens: 1200,
            reasoning: { effort: "low", exclude: true },
          }),
        }),
    });
  }
  return list;
}

export const hasProvider = () => providers().length > 0;

export type Completion =
  | { ok: true; body: ReadableStream<Uint8Array>; provider: string }
  | { ok: false; status: number };

// Returns the first provider's stream that starts successfully. Falls through on
// errors and rate limits, so an OpenAI outage or quota problem still gets an answer.
export async function streamCompletion(messages: Message[]): Promise<Completion> {
  let status = 502;
  for (const p of providers()) {
    const res = await p.call(messages).catch(() => null);
    if (res?.ok && res.body) return { ok: true, body: res.body, provider: `${p.name}/${p.model}` };
    status = res?.status === 429 ? 429 : 502;
    console.error(`${p.name} error`, res?.status, await res?.text().catch(() => ""));
  }
  return { ok: false, status };
}
