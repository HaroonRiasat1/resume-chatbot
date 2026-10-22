import { test } from "node:test";
import assert from "node:assert/strict";
import { resumeMarkdown } from "../src/profile.js";
import { parseFit, NO_EVIDENCE } from "../src/fit.js";
import { corsHeaders, isAllowedOrigin, rateLimited } from "../api/_lib/http.js";

const resume = resumeMarkdown();
const answer = (requirements: unknown[], summary = "He has strong AWS and React experience but no Azure.") =>
  "```json\n" + JSON.stringify({ role: "Full Stack Developer", summary, requirements }) + "\n```";

test("parses fenced JSON and counts levels", () => {
  const fit = parseFit(
    answer([
      { requirement: "React", level: "strong", evidence: "He builds React frontends at Amplon.io." },
      { requirement: "Azure", level: "gap", evidence: "He has used AWS rather than Azure." },
    ]),
    resume,
  );
  assert.ok(fit);
  assert.equal(fit.role, "Full Stack Developer");
  assert.deepEqual(fit.counts, { strong: 1, partial: 0, gap: 1 });
});

test("invented evidence is downgraded to a gap", () => {
  const fit = parseFit(
    answer([
      { requirement: "SAP integration", level: "strong", evidence: "He led SAP S/4HANA migrations for Siemens plants with ABAP workflows." },
    ]),
    resume,
  );
  assert.ok(fit);
  assert.equal(fit.items[0].level, "gap");
  assert.equal(fit.items[0].evidence, NO_EVIDENCE);
});

test("unknown levels become gaps and junk is rejected", () => {
  const fit = parseFit(answer([{ requirement: "Python", level: "expert", evidence: "He used Python and Flask at Amplon.io." }]), resume);
  assert.equal(fit?.items[0].level, "gap");
  assert.equal(parseFit("no json here", resume), null);
  assert.equal(parseFit(answer([]), resume), null);
});

test("an ungrounded summary is replaced with counts", () => {
  const fit = parseFit(
    answer([{ requirement: "React", level: "strong", evidence: "He builds React frontends at Amplon.io." }], "He is a world-famous Kubernetes contributor and Google Developer Expert who wrote three books."),
    resume,
  );
  assert.match(fit!.summary, /^1 of 1 key requirements/);
});

test("CORS only for haroonriasat.com and local dev", () => {
  assert.ok(isAllowedOrigin("https://haroonriasat.com"));
  assert.ok(isAllowedOrigin("http://localhost:5195"));
  assert.ok(!isAllowedOrigin("https://evil.example"));
  const req = (origin: string) => new Request("https://ask.haroonriasat.com/api/chat", { headers: { origin } });
  assert.equal(corsHeaders(req("https://haroonriasat.com"))["Access-Control-Allow-Origin"], "https://haroonriasat.com");
  assert.deepEqual(corsHeaders(req("https://evil.example")), {});
});

test("rate limit blocks after the limit within the window", () => {
  const req = new Request("https://x/api/fit", { headers: { "x-real-ip": "203.0.113.9" } });
  const t = 1_000_000;
  for (let i = 0; i < 3; i++) assert.equal(rateLimited(req, "test", 3, 1000, t + i), false);
  assert.equal(rateLimited(req, "test", 3, 1000, t + 10), true);
  assert.equal(rateLimited(req, "test", 3, 1000, t + 2000), false); // window passed
});

test("job-ad wording counts as known vocabulary for summaries, but strengths still need resume evidence", () => {
  const ad = "We need fluent Finnish, Go microservices, React and AWS.";
  const fit = parseFit(
    answer(
      [
        { requirement: "React", level: "strong", evidence: "He builds React frontends at Amplon.io." },
        { requirement: "Go microservices", level: "strong", evidence: "He wrote Go microservices with gRPC and Kafka streaming pipelines." },
      ],
      "Strong on React and AWS; the gaps are fluent Finnish and Go microservices.",
    ),
    resume,
    ad,
  );
  assert.equal(fit!.summary, "Strong on React and AWS; the gaps are fluent Finnish and Go microservices.");
  assert.equal(fit!.items[1].level, "gap"); // a "strong" claim the resume can't back is still downgraded
});

test("short invented strengths are caught; honest gap notes that echo the ad are kept", () => {
  const ad = "Must know Azure DevOps and Go.";
  const fit = parseFit(
    answer([
      { requirement: "Go", level: "partial", evidence: "He has five years of Rust and WebAssembly experience at Google." },
      { requirement: "Azure DevOps", level: "gap", evidence: "He has used Jira and CI/CD on AWS rather than Azure DevOps." },
      { requirement: "AWS", level: "strong", evidence: "His resume shows hands-on AWS work across EC2, S3, Amplify and Bedrock." },
    ]),
    resume,
    ad,
  );
  assert.deepEqual(fit!.items.map((i) => i.level), ["gap", "gap", "strong"]);
  assert.equal(fit!.items[0].evidence, NO_EVIDENCE);
  assert.match(fit!.items[1].evidence, /rather than Azure DevOps/);
});
