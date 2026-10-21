// POST /api/chat: answers one question about Haroon through a free OpenRouter model.
// The API key stays on the server, and the server builds the prompt itself, so the
// endpoint can't be used as a general-purpose free LLM.
import { DONT_KNOW, OFF_TOPIC, parseChunks, retrieve, route } from "../src/retrieve.js";
import { systemPrompt } from "../src/prompt.js";
import { resumeMarkdown } from "../src/profile.js";

const resume = resumeMarkdown();
const chunks = parseChunks(resume);

// Tried in order; OpenRouter falls through to the next when one is rate-limited or down.
const MODELS = (process.env.OPENROUTER_MODELS ??
  "minimax/minimax-m3.1-flash:free,google/gemma-4-31b-it:free,nvidia/nemotron-3.5-lightning:free")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

interface Turn {
  role: "user" | "assistant";
  content: string;
}

// Free models allow ~50 requests a day per key, so repeat first questions
// (the starter chips, mostly) are answered from memory while the instance is warm.
const cache = new Map<string, string>();

function text(body: string, status = 200): Response {
  return new Response(body, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}

function parseBody(body: unknown): { question: string; history: Turn[] } | null {
  if (!body || typeof body !== "object") return null;
  const { question, history = [] } = body as { question?: unknown; history?: unknown };
  if (typeof question !== "string" || !question.trim() || question.length > 400) return null;
  if (!Array.isArray(history)) return null;
  const turns = history
    .slice(-4)
    .filter(
      (t): t is Turn =>
        !!t && (t.role === "user" || t.role === "assistant") && typeof t.content === "string" && t.content.length <= 2000,
    )
    .map((t) => ({ role: t.role, content: t.content }));
  return { question: question.trim(), history: turns };
}

// Follow-ups like "tell me more about the second one" lean on the previous question.
function relevantLines(question: string, history: Turn[]) {
  const hits = retrieve(question, chunks);
  const previous = history.findLast((t) => t.role === "user")?.content;
  if (hits.length >= 2 || !previous) return hits;
  return [...new Set([...hits, ...retrieve(previous, chunks)])];
}

export async function POST(request: Request): Promise<Response> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return Response.json({ error: "not_configured" }, { status: 503 });

  const parsed = parseBody(await request.json().catch(() => null));
  if (!parsed) return Response.json({ error: "bad_request" }, { status: 400 });
  const { question, history } = parsed;

  const r = route(question, chunks);
  if (r === "private" || r === "unknown") return text(DONT_KNOW);
  if (r === "off-topic") return text(OFF_TOPIC);

  const cacheKey = history.length ? "" : question.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const cached = cacheKey && cache.get(cacheKey);
  if (cached) return text(cached);

  const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/HaroonRiasat1",
      "X-Title": "Chat with Haroon's resume",
    },
    body: JSON.stringify({
      models: MODELS,
      messages: [
        { role: "system", content: systemPrompt(resume, relevantLines(question, history)) },
        ...history,
        { role: "user", content: question },
      ],
      stream: true,
      temperature: 0.1,
      // Reasoning models spend part of this budget thinking, so leave plenty of room for the answer.
      max_tokens: 1200,
      reasoning: { effort: "low", exclude: true },
    }),
  }).catch(() => null);

  if (!upstream?.ok || !upstream.body) {
    const status = upstream?.status === 429 ? 429 : 502;
    console.error("openrouter error", upstream?.status, await upstream?.text().catch(() => ""));
    return Response.json({ error: status === 429 ? "rate_limited" : "upstream_error" }, { status });
  }

  // Turn OpenRouter's server-sent events into a plain text stream of the answer.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  let answer = "";
  let complete = false;
  const stream = upstream.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
          try {
            const event = JSON.parse(line.slice(6));
            const finish = event.choices?.[0]?.finish_reason;
            if (finish === "stop") complete = true;
            else if (event.error || finish) console.error("openrouter stream ended early", finish, event.error ?? "");
            const delta: string = event.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              answer += delta;
              controller.enqueue(encoder.encode(delta));
            }
          } catch {
            // OpenRouter sends keep-alive comments and the odd partial line; skip them.
          }
        }
      },
      flush() {
        if (cacheKey && complete && answer.trim()) cache.set(cacheKey, answer);
      },
    }),
  );
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
