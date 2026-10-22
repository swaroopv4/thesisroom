import test from "node:test";
import assert from "node:assert/strict";
import { draftResearch, modelProvider } from "../lib/providers.ts";
import { research } from "../lib/core.ts";
import { createWorkspace } from "../lib/seed.ts";

const answer = () => research(createWorkspace().sources, "H20 inventory charge", "NVDA");
const reply = (content: string, finish_reason = "stop") => Response.json({ choices: [{ finish_reason, message: { content, reasoning: "internal provider text" } }] });

test("Groq request uses retrieved evidence and bearer auth; only final draft is retained", async () => {
  const initial = answer();
  const result = await draftResearch(initial, "H20 inventory charge", { GROQ_API_KEY: "test-only-key" }, async (url, options) => {
    assert.equal(url, "https://api.groq.com/openai/v1/chat/completions");
    assert.equal(new Headers(options?.headers).get("Authorization"), "Bearer test-only-key");
    const body = JSON.parse(String(options?.body));
    assert.equal(body.include_reasoning, false);
    assert.equal(body.model, "openai/gpt-oss-120b");
    assert.equal(body.tools, undefined);
    assert.equal(body.messages[0].role, "system");
    const context = JSON.parse(body.messages[1].content);
    assert.equal(context.evidence.length, initial.evidence.length);
    assert.equal(context.question, "H20 inventory charge");
    return reply("The supplied issuer evidence reports the charge. [1]");
  });
  assert.match(result.mode!, /^Model draft · Groq/);
  assert.equal(result.content, "The supplied issuer evidence reports the charge. [1]");
  assert.equal(JSON.stringify(result).includes("test-only-key"), false);
  assert.equal(JSON.stringify(result).includes("internal provider text"), false);
  assert.deepEqual(result.sourceVersions, initial.sourceVersions);
});

test("missing, out-of-range citations and truncated output preserve original evidence", async () => {
  for (const response of [reply("No citation"), reply("Wrong reference [999]"), reply("Invalid zero [0]"), reply("Wrong Unicode 【999】"), reply("Wrong group [1, 999]"), reply("Partial answer [1]", "length")]) {
    const initial = answer();
    const result = await draftResearch(initial, "H20", { GROQ_API_KEY: "test-only-key" }, async () => response);
    assert.equal(result.content, initial.content);
    assert.match(result.mode!, /Groq unavailable/);
  }
});

test("Groq Unicode brackets and grouped indices become clickable canonical citations", async () => {
  const result = await draftResearch(answer(), "H20", { GROQ_API_KEY: "test-only-key" }, async () => reply("Charge 【1】 and margin [1, 2], supported together 【1, 2】."));
  assert.match(result.mode!, /^Model draft · Groq/);
  assert.equal(result.content, "Charge [1] and margin [1][2], supported together [1][2].");
});

test("provider HTTP errors and timeouts are contained without leaking provider bodies", async () => {
  for (const request of [async () => new Response("sensitive error details", { status: 401 }), async () => { throw new Error("sensitive network details"); }]) {
    const initial = answer();
    const result = await draftResearch(initial, "H20", { GROQ_API_KEY: "test-only-key" }, request);
    assert.equal(result.content, initial.content);
    assert.match(result.mode!, /Groq unavailable/);
    assert.equal(JSON.stringify(result).includes("sensitive"), false);
  }
});

test("abstention and absent provider avoid model calls; Groq takes precedence", async () => {
  const noNetwork: typeof fetch = async () => { assert.fail("Unexpected model call"); };
  const initial = answer();
  assert.equal(await draftResearch(initial, "H20", {}, noNetwork), initial);
  const empty = { ...initial, evidence: [] };
  assert.equal(await draftResearch(empty, "H20", { GROQ_API_KEY: "test-only-key" }, noNetwork), empty);
  assert.equal(modelProvider({ GROQ_API_KEY: "test", ANTHROPIC_API_KEY: "test" }), "Groq");
  assert.equal(modelProvider({ ANTHROPIC_API_KEY: "test" }), "Anthropic");
});

test("Anthropic alternative keeps its wire format and draft labels", async () => {
  const result = await draftResearch(answer(), "H20", { ANTHROPIC_API_KEY: "test-only-key" }, async (url, options) => {
    assert.equal(url, "https://api.anthropic.com/v1/messages");
    assert.equal(new Headers(options?.headers).get("x-api-key"), "test-only-key");
    return Response.json({ stop_reason: "end_turn", content: [{ type: "text", text: "Issuer evidence [1]" }] });
  });
  assert.match(result.mode!, /^Model draft · Anthropic/);
});
