import "./style.css";
import { DONT_KNOW, OFF_TOPIC, parseChunks, quickAnswer, route } from "./retrieve.js";
import { renderMarkdown } from "./markdown.js";
import { isGrounded } from "./grounding.js";
import { resumeMarkdown } from "./profile.js";
import { CATEGORIES, type Category } from "./cards.js";
import { icon } from "./icons.js";

const resume = resumeMarkdown();
const chunks = parseChunks(resume);
const chat = document.querySelector<HTMLElement>("#chat")!;
const form = document.querySelector<HTMLFormElement>("#form")!;
const input = document.querySelector<HTMLInputElement>("#input")!;
const send = document.querySelector<HTMLButtonElement>("#send")!;
const quick = document.querySelector<HTMLElement>("#quick")!;
const status = document.querySelector<HTMLElement>("#status")!;

let busy = false;
// Only the AI's own answers go back as context; quick answers and cards are not its words.
const history: { role: "user" | "assistant"; content: string }[] = [];

function startChat() {
  if (document.body.classList.contains("chatting")) return;
  document.body.classList.replace("landing", "chatting");
  input.placeholder = "Ask a follow-up…";
}

function scrollDown() {
  chat.scrollTo({ top: chat.scrollHeight, behavior: "smooth" });
}

function addUser(text: string) {
  const el = document.createElement("div");
  el.className = "msg user";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  el.append(bubble);
  chat.append(el);
  scrollDown();
}

function addBot(text: string, tag?: string): HTMLElement {
  const el = document.createElement("div");
  el.className = "msg bot";
  el.innerHTML = '<span class="avatar sm" aria-hidden="true">HR</span><div class="body"></div>';
  setBot(el, text, tag);
  chat.append(el);
  scrollDown();
  return el;
}

function setBot(el: HTMLElement, text: string, tag?: string) {
  const body = el.querySelector<HTMLElement>(".body")!;
  body.innerHTML = text ? renderMarkdown(text) : '<span class="dots" aria-label="Typing"><i></i><i></i><i></i></span>';
  if (tag) {
    const t = document.createElement("span");
    t.className = "tag";
    t.textContent = tag;
    body.append(t);
  }
}

async function answerWithModel(question: string, el: HTMLElement) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history: history.slice(-4) }),
  }).catch(() => null);

  if (!res?.ok || !res.body) {
    const tag =
      res?.status === 429
        ? "The free AI model is busy right now, so here are the matching resume lines"
        : "The AI couldn't be reached, so here are the matching resume lines";
    setBot(el, quickAnswer(question, chunks), tag);
    return;
  }

  const sources = parseSources(res.headers.get("X-Sources"));
  let text = "";
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += value;
    setBot(el, text);
    chat.scrollTop = chat.scrollHeight;
  }

  if (!text.trim() || !isGrounded(text, resume, question)) {
    // Keep a drifted answer out of the history so later turns don't build on it.
    setBot(el, quickAnswer(question, chunks), "The AI's reply went beyond the resume, so here are the matching lines");
    return;
  }
  history.push({ role: "user", content: question }, { role: "assistant", content: text });
  if (sources.length && !/I don't know|I can only answer/.test(text)) addSources(el, sources, res.headers.get("X-Retrieval"));
}

function parseSources(header: string | null): string[] {
  try {
    const list = JSON.parse(decodeURIComponent(header ?? "[]"));
    return Array.isArray(list) ? list.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

// RAG transparency: which parts of the resume the answer was grounded in.
function addSources(el: HTMLElement, sources: string[], mode: string | null) {
  const row = document.createElement("div");
  row.className = "sources";
  const label = document.createElement("span");
  label.textContent = mode === "vector" ? "Sources · vector search" : "Sources";
  row.append(label);
  for (const s of sources) {
    const chip = document.createElement("span");
    chip.className = "src";
    chip.textContent = s;
    row.append(chip);
  }
  el.querySelector(".body")!.append(row);
}

async function run(task: () => Promise<void> | void) {
  if (busy) return;
  busy = true;
  send.disabled = true;
  startChat();
  await task();
  busy = false;
  send.disabled = false;
}

function ask(question: string) {
  question = question.trim();
  if (!question) return;
  input.value = "";
  return run(async () => {
    addUser(question);
    // Private and off-topic questions are answered here instantly. Everything else goes
    // to the server, whose vector search decides whether the resume covers it.
    const r = route(question, chunks);
    const el = addBot(r === "off-topic" ? OFF_TOPIC : r === "private" ? DONT_KNOW : "");
    if (r !== "off-topic" && r !== "private") await answerWithModel(question, el);
  });
}

// Category buttons answer with a card built from the resume data: instant, free, exact.
function showCategory(c: Category) {
  return run(() => {
    addUser(c.question);
    const el = addBot(c.intro);
    const rich = document.createElement("div");
    rich.className = "rich";
    rich.append(c.card());
    el.querySelector(".body")!.append(rich);
    scrollDown();
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  ask(input.value);
});

for (const c of CATEGORIES) {
  const b = document.createElement("button");
  b.type = "button";
  b.dataset.id = c.id;
  b.append(icon(c.id), c.label);
  b.onclick = () => showCategory(c);
  quick.append(b);
}

for (const el of document.querySelectorAll<HTMLElement>("[data-icon]")) el.innerHTML = icon(el.dataset.icon!).innerHTML;

status.textContent = "AI answers grounded only in Haroon's resume";

// Handy for debugging in the console.
Object.assign(window, { resumeChat: { ask, showCategory: (id: string) => showCategory(CATEGORIES.find((c) => c.id === id)!) } });
