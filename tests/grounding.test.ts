import { test } from "node:test";
import assert from "node:assert/strict";
import { resumeMarkdown } from "../src/profile.js";
import { isGrounded } from "../src/grounding.js";

const resume = resumeMarkdown();

test("faithful answers pass", () => {
  for (const a of [
    "Haroon has experience with AWS services such as EC2, S3, Amplify, Bedrock, SageMaker.",
    "Haroon has a Master's degree in Information Technology (Computer Engineering) from Åbo Akademi University and a Bachelor's degree in Computer Science from FAST-NUCES.",
    "Yes, Haroon has led a team of 6 software engineers at QUEST I-8.",
    "I don't know. That isn't in Haroon's resume. You could ask him at haroonriasatali@gmail.com.",
  ]) assert.ok(isGrounded(a, resume, "q"), a);
});

test("invented answers fail", () => {
  for (const a of [
    "Yes, Haroon knows Kubernetes and has deployed clusters on Google Cloud with Helm.",
    "Sure! Here's a simple Python function to reverse a string: def reverse_string(s): return s[::-1]",
    "The app will suggest nearby venues based on your interests. You can see what other users are doing at the same time. Budgeting tools allow you to set a daily budget and see where you're going to spend money.",
  ]) assert.ok(!isGrounded(a, resume, "q"), a);
});
