import "./style.css";
import resume from "./resume.md?raw";
import { DONT_KNOW, OFF_TOPIC, parseChunks, quickAnswer, route } from "./retrieve.js";
import { renderMarkdown } from "./markdown.js";
import { isGrounded } from "./grounding.js";

const STARTERS = [
  { label: "Cloud", question: "What's his AWS experience?" },
  { label: "AI", question: "Which AI projects has he built?" },
  { label: "Right now", question: "Where does he work now?" },
  { label: "For fun", question: "Tell me about wild-frequencies" },
];

// Offered as follow-up chips under answers, skipping anything already asked.
const SUGGESTIONS = [
  ...STARTERS.map((s) => s.question),
  "Has he led a team?",
  "What did he do at Exitech?",
  "What's his education?",
  "Does he build mobile apps?",
  "Which side projects can I try live?",
  "How can I contact him?",
];
const asked = new Set<string>();

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
  if (role === "bot") {
    el.innerHTML = '<div class="avatar" aria-hidden="true">H</div><div class="body"></div>';
  }
  setMessage(el, text, tag);
  chat.append(el);
  chat.scrollTop = chat.scrollHeight;
  return el;
}

function setMessage(el: HTMLElement, text: string, tag?: string) {
  if (el.classList.contains("user")) {
    el.textContent = text;
    return;
  }
  const body = el.querySelector<HTMLElement>(".body")!;
  body.innerHTML = text ? renderMarkdown(text) : '<span class="dots" aria-label="Typing"><i></i><i></i><i></i></span>';
  if (tag) {
    const t = document.createElement("span");
    t.className = "tag";
    t.textContent = tag;
    body.append(t);
  }
}

function addFollowups(el: HTMLElement) {
  const next = SUGGESTIONS.filter((q) => !asked.has(q)).slice(0, 3);
  if (!next.length) return;
  const row = document.createElement("div");
  row.className = "followups";
  for (const q of next) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = q;
    b.onclick = () => ask(q);
    row.append(b);
  }
  el.querySelector(".body")!.append(row);
  chat.scrollTop = chat.scrollHeight;
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
  asked.add(question);
  starters.replaceChildren();
  document.body.classList.add("started");
  chat.querySelectorAll(".followups").forEach((f) => f.remove());
  addMessage("user", question);
  input.value = "";

  // The server applies the same routing; checking here too answers instantly.
  const r = route(question, chunks);
  const el = addMessage("bot", r === "off-topic" ? OFF_TOPIC : r === "answer" ? "" : DONT_KNOW);
  if (r === "answer") await answerWithModel(question, el);
  addFollowups(el);

  busy = false;
  send.disabled = false;
  input.focus();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  ask(input.value);
});

for (const { label, question } of STARTERS) {
  const b = document.createElement("button");
  b.type = "button";
  const tag = document.createElement("span");
  tag.textContent = label;
  b.append(tag, question);
  b.onclick = () => ask(question);
  starters.append(b);
}

// Duplicate the stack ticker so its -50% scroll loops seamlessly.
const track = document.querySelector<HTMLElement>(".track");
if (track) track.innerHTML += track.innerHTML;

addMessage("bot", INTRO);
status.textContent = "Open-source AI · grounded only in Haroon's resume";

// Handy for debugging in the console.
Object.assign(window, { resumeChat: { ask } });
