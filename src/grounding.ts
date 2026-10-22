import { terms } from "./retrieve.js";

// Everyday words a faithful answer uses that the resume itself may not contain.
const COMMON = new Set(
  ("yes no sure service such degree master bachelor feature include several hold work worked working " +
    "currently also known include including well both various multiple experience experienced project " +
    "skill skilled background knowledge called named " +
    "january february march april may june july august september october november december").split(" "),
);

const stem = (w: string) => w.replace(/(ing|ed|es|s)$/, "");

// A cheap hallucination check: if most of an answer's content words never appear
// in the resume (or the question), the model has drifted into making things up.
export function isGrounded(answer: string, resume: string, question: string): boolean {
  if (/I don't know|I can only answer/i.test(answer)) return true;
  const vocab = new Set([...terms(resume), ...terms(question)].map(stem));
  const words = terms(answer).filter((w) => w.length > 3);
  const missing = words.filter((w) => !vocab.has(stem(w)) && !COMMON.has(stem(w)) && !COMMON.has(w));
  // Tuned on real answers (at most ~15% unseen words) vs invented ones (~47%+).
  return missing.length < 5 || missing.length / words.length <= 0.3;
}
