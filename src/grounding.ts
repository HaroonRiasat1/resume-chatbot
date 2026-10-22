import { terms } from "./retrieve.js";

// Everyday words a faithful answer uses that the resume itself may not contain.
const COMMON = new Set(
  ("yes no sure service such degree master bachelor feature include several hold work worked working " +
    "currently also known include including well both various multiple experience experienced project " +
    "skill skilled background knowledge called named course courses learning learn studying " +
    "january february march april may june july august september october november december " +
    // evaluative words used in summaries; they carry no factual claims
    "look looks seem seems appear appears strong strongly solid substantial extensive main mainly key core overall " +
    "match matches fit fits gap gaps area areas relevant direct directly clear clearly explicit explicitly " +
    "demonstrate demonstrated show shows shown prove proven evidence even though although however especially " +
    "particularly mostly limited lack lacks missing likely good great notable primary role requirement requirements").split(" "),
);

const stem = (w: string) => w.replace(/(ing|ed|es|s)$/, "");

// Content words of `text` that appear nowhere in the resume or `extra` (the question).
export function unseenWords(text: string, resume: string, extra = ""): string[] {
  const vocab = new Set([...terms(resume), ...terms(extra)].map(stem));
  return terms(text)
    .filter((w) => w.length > 3)
    .filter((w) => !vocab.has(stem(w)) && !COMMON.has(stem(w)) && !COMMON.has(w));
}

// A cheap hallucination check: if most of an answer's content words never appear
// in the resume (or the question), the model has drifted into making things up.
export function isGrounded(answer: string, resume: string, question: string): boolean {
  if (/I don't know|I can only answer/i.test(answer)) return true;
  const words = terms(answer).filter((w) => w.length > 3);
  const missing = unseenWords(answer, resume, question);
  // Tuned on real answers (at most ~15% unseen words) vs invented ones (~47%+).
  return missing.length < 5 || missing.length / words.length <= 0.3;
}
