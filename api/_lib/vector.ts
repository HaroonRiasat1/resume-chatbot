// Upstash Vector holds one entry per resume line. The index embeds text itself
// (BAAI/bge-base-en-v1.5), so no separate embedding API or key is needed.
import { Index } from "@upstash/vector";
import type { Chunk } from "../../src/retrieve.js";

export interface ChunkMeta {
  section: string;
  text: string;
  [key: string]: unknown;
}

export interface Hit {
  chunk: Chunk;
  score: number;
}

let index: Index<ChunkMeta> | null | undefined;

// Returns null when the env vars aren't set, so the app falls back to keyword search.
export function vectorIndex(): Index<ChunkMeta> | null {
  if (index === undefined) {
    const url = process.env.UPSTASH_VECTOR_REST_URL;
    const token = process.env.UPSTASH_VECTOR_REST_TOKEN;
    index = url && token ? new Index<ChunkMeta>({ url, token }) : null;
  }
  return index;
}

export const chunkId = (i: number) => `resume-${String(i).padStart(3, "0")}`;
export const chunkText = (c: Chunk) => `${c.section}: ${c.text}`;

export async function semanticSearch(question: string, topK = 6): Promise<Hit[] | null> {
  const idx = vectorIndex();
  if (!idx) return null;
  try {
    const results = await idx.query({ data: question, topK, includeMetadata: true });
    return results
      .filter((r) => r.metadata)
      .map((r) => ({ chunk: { section: r.metadata!.section, text: r.metadata!.text }, score: r.score }));
  } catch (err) {
    console.error("vector search failed, using keyword search", err);
    return null;
  }
}
