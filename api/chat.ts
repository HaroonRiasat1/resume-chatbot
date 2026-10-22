// POST /api/chat: answers one question about Haroon through a free OpenRouter model.
// The API key stays on the server, and the server builds the prompt itself, so the
// endpoint can't be used as a general-purpose free LLM.
import { DONT_KNOW, OFF_TOPIC, parseChunks, retrieve, route, terms, type Chunk } from "../src/retrieve.js";
import { systemPrompt } from "../src/prompt.js";
import { resumeMarkdown } from "../src/profile.js";
import { fallbackReason, semanticSearch } from "./_lib/vector.js";

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

// Upstash scores are cosine similarity mapped to 0..1. A question at least this close
// to some resume line is treated as answerable even when no keyword matches.
// Tuned with scripts/eval-retrieval.ts: short resume lines make off-resume questions
// ("Has he worked at Google?") score up to ~0.71, so only clearly closer matches count.
const MIN_SCORE = Number(process.env.VECTOR_MIN_SCORE ?? 0.74);
// Context keeps lines scoring within this distance of the best match.
const SCORE_WINDOW = 0.06;

// Free models allow ~50 requests a day per key, so repeat first questions
// (the starter chips, mostly) are answered from memory while the instance is warm.
const cache = new Map<string, { answer: string; sources: string }>();

function text(body: string, extra: Record<string, string> = {}): Response {
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", ...extra },
  });
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

interface Context {
  lines: Chunk[];
  answerable: boolean;
  mode: "vector" | `keyword${string}`;
}

const dedupe = (lines: Chunk[]) => [...new Map(lines.map((c) => [c.text, c])).values()];

// Hybrid retrieval: semantic search in Upstash Vector plus the keyword matcher.
// Keyword hits are always kept, so exact names ("Exitech") never get lost.
async function retrieveContext(question: string, history: Turn[]): Promise<Context> {
  const keyword = retrieve(question, chunks);
  // Follow-ups like "tell me more about the second one" lean on the previous question.
  const previous = history.findLast((t) => t.role === "user")?.content;
  const semantic = await semanticSearch(previous ? `${previous}\n${question}` : question);

  if (!semantic) {
    const lines = keyword.length >= 2 || !previous ? keyword : dedupe([...keyword, ...retrieve(previous, chunks)]);
    return { lines, answerable: route(question, chunks) === "answer", mode: `keyword (vector ${fallbackReason})` };
  }
  const best = semantic[0]?.score ?? 0;
  const close = semantic.filter((h) => h.score >= Math.max(MIN_SCORE - 0.05, best - SCORE_WINDOW)).map((h) => h.chunk);
  // Broad questions ("Who is Haroon?", "Why hire him?") get the whole resume instead of a
  // few loosely related lines. Without keywords, a high score usually just means the
  // question shares his name with the Contact lines.
  const broad = !terms(question).length || (!keyword.length && best < MIN_SCORE);
  // Most relevant first: lines both searches agree on, then semantic order, then keyword-only.
  const semanticTexts = new Set(close.map((c) => c.text));
  const agreed = keyword.filter((k) => semanticTexts.has(k.text));
  return {
    lines: broad ? [] : dedupe([...agreed, ...close, ...keyword]).slice(0, 8),
    answerable: route(question, chunks) === "answer" || best >= MIN_SCORE,
    mode: "vector",
  };
}

export async function POST(request: Request): Promise<Response> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return Response.json({ error: "not_configured" }, { status: 503 });

  const parsed = parseBody(await request.json().catch(() => null));
  if (!parsed) return Response.json({ error: "bad_request" }, { status: 400 });
  const { question, history } = parsed;

  const r = route(question, chunks);
  if (r === "private") return text(DONT_KNOW);
  if (r === "off-topic") return text(OFF_TOPIC);

  const cacheKey = history.length ? "" : question.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const cached = cacheKey && cache.get(cacheKey);
  if (cached) return text(cached.answer, { "X-Sources": cached.sources });

  const context = await retrieveContext(question, history);
  if (!context.answerable) return text(DONT_KNOW, { "X-Retrieval": context.mode });
  // Section names of the lines the answer is grounded in, for the "Sources" row in the UI.
  // The three most relevant sections; empty when the whole resume was used.
  const sources = encodeURIComponent(JSON.stringify([...new Set(context.lines.map((c) => c.section))].slice(0, 3)));

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
        { role: "system", content: systemPrompt(resume, context.lines) },
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
        if (cacheKey && complete && answer.trim()) cache.set(cacheKey, { answer, sources });
      },
    }),
  );
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Sources": sources, "X-Retrieval": context.mode },
  });
}
