import "./style.css";
import resume from "./resume.md?raw";
import { DONT_KNOW, OFF_TOPIC, parseChunks, quickAnswer, route } from "./retrieve.js";
import { renderMarkdown } from "./markdown.js";
import { isGrounded } from "./grounding.js";

const STARTERS = [
  "What's his AWS experience?",
  "Which AI projects has he built?",
  "Where does he work now?",
  "What's his education?",
  "Tell me about wild-frequencies",
];

const INTRO =
  "Hi, I'm Haroon's AI assistant. Ask me about his experience, projects, skills, or education. " +
  "I only answer from his resume, so if something isn't in it, I'll tell you I don't know.";

const chunks = parseChunks(resume);
const chat = document.querySelector<HTMLElement>("#chat")!;
const form = document.querySelector<HTMLFormElement>("#form")!;
const input = document.querySelector<HTMLInputElement>("#input")!;
const send = document.querySelector<HTMLButtonElement>("#send")!;
const starters = document.querySelector<HTMLElement>("#starters")!;
const status = document.querySelector<HTMLElement>("#status")!;

let busy = false;
// Only the AI's own answers go back as context; quick answers are not its words.
const history: { role: "user" | "assistant"; content: string }[] = [];

function addMessage(role: "user" | "bot", text: string, tag?: string): HTMLElement {
  const el = document.createElement("div");
  el.className = `msg ${role}`;
  setMessage(el, text, tag);
  chat.append(el);
  chat.scrollTop = chat.scrollHeight;
  return el;
}

function setMessage(el: HTMLElement, text: string, tag?: string) {
  if (el.classList.contains("user")) el.textContent = text;
  else el.innerHTML = renderMarkdown(text);
  if (tag) {
    const t = document.createElement("span");
    t.className = "tag";
    t.textContent = tag;
    el.append(t);
  }
}

async function answerWithModel(question: string, el: HTMLElement) {
  el.classList.add("typing");
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history: history.slice(-4) }),
  }).catch(() => null);

  if (!res?.ok || !res.body) {
    el.classList.remove("typing");
    const tag =
      res?.status === 429
        ? "Quick answer: the free AI model is busy right now, so here are the resume lines"
        : "Quick answer: the AI couldn't be reached, so here are the resume lines";
    setMessage(el, quickAnswer(question, chunks), tag);
    return;
  }

  let text = "";
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += value;
    setMessage(el, text);
    chat.scrollTop = chat.scrollHeight;
  }
  el.classList.remove("typing");

  if (!text.trim() || !isGrounded(text, resume, question)) {
    // Keep a drifted answer out of the history so later turns don't build on it.
    setMessage(el, quickAnswer(question, chunks), "Quick answer: the AI's reply went beyond the resume, so here are the resume lines");
    return;
  }
  history.push({ role: "user", content: question }, { role: "assistant", content: text });
}

async function ask(question: string) {
  question = question.trim();
  if (!question || busy) return;
  busy = true;
  send.disabled = true;
  starters.replaceChildren();
  addMessage("user", question);
  input.value = "";

  // The server applies the same routing; checking here too answers instantly.
  const r = route(question, chunks);
  if (r === "private" || r === "unknown") addMessage("bot", DONT_KNOW);
  else if (r === "off-topic") addMessage("bot", OFF_TOPIC);
  else await answerWithModel(question, addMessage("bot", ""));

  busy = false;
  send.disabled = false;
  input.focus();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  ask(input.value);
});

for (const q of STARTERS) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = q;
  b.onclick = () => ask(q);
  starters.append(b);
}

addMessage("bot", INTRO);
status.textContent = "Answers come from an open-source AI model and are grounded only in Haroon's resume.";

// Handy for debugging in the console.
Object.assign(window, { resumeChat: { ask } });
