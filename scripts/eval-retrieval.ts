// Prints the best vector match for questions that should and shouldn't be
// answerable, to pick VECTOR_MIN_SCORE. Uses Upstash queries only, no LLM calls.
//   npx tsx --env-file=.env.local scripts/eval-retrieval.ts
import { semanticSearch } from "../api/_lib/vector.js";
import { parseChunks, route } from "../src/retrieve.js";
import { resumeMarkdown } from "../src/profile.js";

const chunks = parseChunks(resumeMarkdown());
const minScore = Number(process.env.VECTOR_MIN_SCORE ?? 0.74);

const answerable = [
  "What's his education?",
  "Where did he go to uni?",
  "Has he managed people?",
  "Which cloud platforms does he know?",
  "Has he built anything with speech-to-text?",
  "Does he have experience with vector databases?",
  "What did he do at Exitech?",
  "Is he good with iOS development?",
  "Any games?",
  "Which projects can I try in the browser?",
  "Has he worked at a startup?",
  "What is he doing right now?",
  "Does he know Kubernetes?",
  "What was his thesis about?",
  "Has he won any awards?",
  "What languages does he speak?",
  "What are his hobbies?",
  "What is Kinwell?",
];
const unanswerable = [
  "Does he know Rust?",
  "Does he know Terraform?",
  "Has he worked at Google?",
  "Does he speak German?",
  "What's the capital of France?",
  "Is he good at football?",
  "Has he used Azure?",
];

for (const [label, qs] of [["SHOULD ANSWER", answerable], ["SHOULD REFUSE", unanswerable]] as const) {
  console.log(`\n${label}`);
  for (const q of qs) {
    const hits = await semanticSearch(q, 3);
    if (!hits) throw new Error("Upstash env vars missing");
    const top = hits[0];
    const keyword = route(q, chunks);
    const decision = keyword === "answer" || (keyword !== "private" && keyword !== "off-topic" && top.score >= minScore) ? "answer" : "refuse";
    console.log(`${decision.padEnd(7)} ${top.score.toFixed(3)} kw=${keyword.padEnd(9)} ${q.padEnd(48)} -> [${top.chunk.section}]`);
  }
}
