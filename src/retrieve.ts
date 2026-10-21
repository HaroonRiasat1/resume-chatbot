// Keyword retrieval over the resume. Used for instant "quick answers" while the
// AI model downloads, and as the full fallback on browsers without WebGPU.

export interface Chunk {
  section: string;
  text: string;
}

export function parseChunks(md: string): Chunk[] {
  const chunks: Chunk[] = [];
  let section = "About";
  for (const raw of md.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("# ")) continue;
    if (line.startsWith("## ")) {
      section = line.slice(3).trim();
      continue;
    }
    chunks.push({ section, text: line.replace(/^- /, "") });
  }
  return chunks;
}

const STOPWORDS = new Set(
  ("a an the and or of in on at to for with by from is are was were be been his her he him " +
    "haroon riasat haroons what which who whom how does do did has have had any some about " +
    "tell me you your can could would should please i we it its this that these those there " +
    "as into than then so if not much many more most also just like used use uses using " +
    "one ones where when why built build made make know give list show any kind sort")
    .split(" "),
);

// Query words that should also match related resume vocabulary.
const SYNONYMS: Record<string, string[]> = {
  background: ["summary", "experience"],
  overview: ["summary"],
  bio: ["summary"],
  profile: ["summary"],
  aws: ["ec2", "s3", "amplify", "bedrock", "sagemaker", "cloud"],
  cloud: ["aws", "devops"],
  ai: ["llm", "rag", "openai", "claude", "gemini", "embeddings", "ai-powered", "ai-based", "langchain"],
  llm: ["ai", "rag", "openai", "claude", "gemini"],
  ml: ["ai/ml", "sagemaker"],
  job: ["experience", "engineer"],
  work: ["experience", "engineer"],
  worked: ["experience", "engineer"],
  company: ["experience"],
  career: ["experience"],
  employer: ["experience"],
  current: ["present"],
  currently: ["present"],
  now: ["present"],
  study: ["education", "university"],
  graduate: ["education", "m.sc"],
  graduation: ["education", "m.sc"],
  skill: ["stack"],
  studied: ["education", "university"],
  degree: ["education", "m.sc", "b.sc"],
  university: ["education"],
  school: ["education"],
  master: ["m.sc"],
  masters: ["m.sc"],
  bachelor: ["b.sc"],
  certified: ["certifications"],
  certification: ["certifications"],
  contact: ["email", "linkedin", "github"],
  reach: ["contact", "email"],
  hire: ["contact", "email"],
  mobile: ["ios", "react native", "swift", "swiftui"],
  ios: ["swift", "swiftui", "mobile"],
  frontend: ["react", "next.js", "tailwind"],
  backend: ["node.js", "express", "python", "flask", "django"],
  database: ["databases", "postgresql", "mongodb", "sql"],
  game: ["games", "platformer", "runner", "concert"],
  games: ["game", "platformer", "runner"],
  side: ["personal", "projects"],
  location: ["turku", "finland"],
  live: ["turku", "finland", "based"],
  based: ["turku", "finland"],
  team: ["led"],
  lead: ["led", "team"],
  leadership: ["led", "team", "co-founded"],
  founder: ["co-founder", "co-founded"],
  startup: ["co-founder", "consultancy"],
  skills: ["stack"],
  languages: ["typescript", "javascript", "python", "php", "c++", "assembly", "swift"],
};

function stem(word: string): string {
  return word.length > 3 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word;
}

export function terms(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9][a-z0-9.+/#-]*/g) ?? [])
    .map((w) => w.replace(/[.]+$/, "").replace(/'s$/, ""))
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

export function retrieve(question: string, chunks: Chunk[], limit = 5): Chunk[] {
  const query = [...new Set(terms(question))];
  if (!query.length) return [];
  const docs = chunks.map((chunk) => {
    const text = chunk.text.toLowerCase();
    return { chunk, text, section: chunk.section.toLowerCase(), words: new Set(terms(text).map(stem)) };
  });
  const hits = (doc: (typeof docs)[number], word: string) =>
    doc.words.has(stem(word)) || (word.length > 3 && doc.text.includes(word));
  // Rarer words count for more, so "aws" outweighs a broad word like "experience".
  const weight = (word: string) => {
    const df = docs.filter((d) => hits(d, word) || d.section.includes(word)).length;
    return Math.log(1 + docs.length / (df || 1));
  };
  const scored = docs.map((doc) => {
    let score = 0;
    for (const q of query) {
      if (hits(doc, q)) {
        // Lines dense with related terms (e.g. "AWS (EC2, S3, Bedrock...)") rank higher.
        const related = SYNONYMS[q]?.filter((s) => hits(doc, s)).length ?? 0;
        score += weight(q) * (1 + 0.15 * related);
      }      else {
        const syn = SYNONYMS[q]?.find((s) => hits(doc, s) || doc.section.includes(s));
        // Naming a section ("education", "skills") matches every line in it.
        score += Math.max(doc.section.includes(stem(q)) ? weight(q) : 0, syn ? 0.6 * weight(syn) : 0);
      }
    }
    return { chunk: doc.chunk, score };
  });
  const best = Math.max(0, ...scored.map((s) => s.score));
  if (best < 1) return [];
  return scored
    .filter((s) => s.score >= best * 0.6)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.chunk);
}

// Personal details that are never in the resume. Refuse these up front instead
// of letting a keyword ("phone" -> "phones") or a small model drift into a guess.
const PRIVATE = /\b(salary|salaries|pay|paid|earn|earns|income|rate|phone|number|address|age|old|birthday|born|married|wife|husband|girlfriend|boyfriend|kids|children|religion|politic\w*|visa|passport|ssn|weight|height|nationality|favou?rite|hobby|hobbies)\b/i;

export function isPrivateQuestion(question: string): boolean {
  return PRIVATE.test(question) && !/\b(projects?|years of experience|team)\b/i.test(question);
}

export const CONTACT_EMAIL = "haroonriasatali@gmail.com";
export const DONT_KNOW = `I don't know. That isn't in Haroon's resume. You could ask him at ${CONTACT_EMAIL}.`;
export const OFF_TOPIC =
  "I can only answer questions about Haroon: his experience, projects, skills, and education. What would you like to know about him?";

const ABOUT_HAROON = /\b(he|his|him|himself|haroon|riasat)\b/i;
const TASK = /\b(write|code|coding|function|script|program|poem|story|joke|translate|solve|calculate|recipe|weather|debug|fix my|how do i|how to)\b/i;
// Broad or follow-up questions that keyword search can't match but the model can answer from the whole resume.
const OPEN_ENDED = /\b(who|background|about|overview|summary|summarize|bio|profile|introduce|strengths?|hire|fit|tell me more|more|that|it|this|those|them|they|first|second|third|last|other|else)\b/i;

export type Route = "private" | "off-topic" | "unknown" | "answer";

// Decides what to do before any model runs. Small models happily invent skills
// ("Yes, he knows Kubernetes") or do unrelated tasks, so the clear cases are
// answered deterministically and only plausible resume questions reach the model.
export function route(question: string, chunks: Chunk[]): Route {
  if (isPrivateQuestion(question)) return "private";
  if (TASK.test(question) && !ABOUT_HAROON.test(question)) return "off-topic";
  if (retrieve(question, chunks).length || !terms(question).length || OPEN_ENDED.test(question)) return "answer";
  return "unknown";
}

export function quickAnswer(question: string, chunks: Chunk[]): string {
  const r = route(question, chunks);
  if (r === "off-topic") return OFF_TOPIC;
  const hits = r === "private" ? [] : retrieve(question, chunks);
  if (!hits.length) return DONT_KNOW;
  return "Here's what Haroon's resume says:\n" + hits.map((h) => `- **${h.section}:** ${h.text}`).join("\n");
}
