// Pushes every line of the resume (from src/profile.ts) into Upstash Vector.
// Runs on each Vercel build so the index always matches the deployed resume.
//   npm run ingest
import { resumeMarkdown } from "../src/profile.js";
import { parseChunks } from "../src/retrieve.js";
import { chunkId, chunkText, vectorIndex } from "../api/_lib/vector.js";

const index = vectorIndex();
if (!index) {
  console.warn("ingest: UPSTASH_VECTOR_REST_URL / UPSTASH_VECTOR_REST_TOKEN not set, skipping (keyword search will be used).");
  process.exit(0);
}

const chunks = parseChunks(resumeMarkdown());
// Start clean so lines removed from the resume don't linger in the index.
await index.reset();
await index.upsert(
  chunks.map((c, i) => ({ id: chunkId(i), data: chunkText(c), metadata: { section: c.section, text: c.text } })),
);
const info = await index.info();
console.log(`ingest: upserted ${chunks.length} resume chunks (${info.denseIndex?.embeddingModel || "custom"} embeddings, ${info.dimension} dims).`);
