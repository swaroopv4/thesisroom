import test from "node:test";
import assert from "node:assert/strict";
import { addSource, changeSource, research, reviewProposal, runEvaluations, sanitize, scanTheses } from "../lib/core.ts";
import { createWorkspace } from "../lib/seed.ts";

test("built-in evaluation suite runs actual checks and passes", () => {
  const run = runEvaluations();
  assert.equal(run.total, 16);
  assert.deepEqual(run.cases.filter(c => !c.passed).map(c => c.name), []);
});
test("a research answer's evidence is invalidated after revocation, including restored sources", () => {
  const w = createWorkspace();
  const answer = research(w.sources, "H20 inventory charge", "NVDA");
  assert(answer.evidence.some(e => e.sourceId === "nvda-q1"));
  w.messages.push(answer); changeSource(w, "nvda-q1", "revoked");
  const clean = sanitize(w);
  assert.equal(clean.messages[0].stale, true);
  assert(!clean.messages[0].content.includes("4.5"));
  changeSource(w, "nvda-q1", "active");
  assert.equal(sanitize(w).messages[0].stale, true);
  assert.equal(research(w.sources, "H20 charge", "NVDA").evidence.length > 0, true);
});
test("explicit period and as-of apply to computed comparisons, not only retrieval", () => {
  const w = createWorkspace();
  const result = research(w.sources, "Compare NVIDIA revenue Q4 FY2025", "NVDA", "2025-02-28");
  assert(!result.content.includes("44.062"));
  assert(result.evidence.every(e => e.sourceId === "nvda-q4"));
});
test("source replacement supersedes the old evidence, deduplicates and invalidates stored answers", async () => {
  const w = createWorkspace();
  w.messages.push(research(w.sources, "H20 charge", "NVDA"));
  const raw = { title: "Revised source", content: "Revised NVIDIA disclosure. H20 data requires a fresh review of all prior analysis.", company: "NVDA", published: "2025-05-29", replaces: "nvda-q1" };
  const source = await addSource(w, raw);
  assert.equal(w.sources.find(s => s.id === "nvda-q1")?.status, "superseded");
  assert.equal(source.hash.length, 64);
  assert.equal(sanitize(w).messages[0].stale, true);
  await assert.rejects(() => addSource(w, raw), /already active/);
});
test("accept is an explicit decision; scans and rejections leave current research intact", () => {
  const w = createWorkspace(), before = w.theses[0].statement;
  scanTheses(w); assert.equal(w.theses[0].statement, before);
  const proposal = w.proposals.find(p => p.thesisId === "margin")!;
  reviewProposal(w, proposal.id, "accepted");
  assert.equal(w.theses[0].statement, proposal.after);
  assert.equal(w.activity[0].action, "Research update accepted");
  assert.throws(() => reviewProposal(w, proposal.id, "accepted"), /no longer pending/);
});
test("invalid source input is rejected before it can supersede evidence", async () => {
  const w = createWorkspace();
  await assert.rejects(() => addSource(w, { title: "Bad URL", content: "A document with sufficient text to validate this input.", company: "NVDA", url: "javascript:alert(1)", replaces: "nvda-q1" }), /HTTPS/);
  assert.equal(w.sources.find(s => s.id === "nvda-q1")?.status, "active");
});
test("an uploaded, analyst-checked metric feeds a new thesis review", async () => {
  const w = createWorkspace();
  const source = await addSource(w, { title: "Test fixture only", company: "NVDA", published: "2025-05-29", content: "Test fixture disclosure for software verification only. GAAP gross margin was 66.5% in the test period.", metric: { metric: "gross_margin", value: 66.5, period: "TEST PERIOD", verified: true } });
  scanTheses(w);
  const proposal = w.proposals.find(p => p.thesisId === "margin")!;
  assert(proposal.after.includes("66.5"));
  assert.deepEqual(proposal.sourceIds, [source.id]);
});
test("unverified metrics cannot replace active research", async () => {
  const w = createWorkspace();
  await assert.rejects(() => addSource(w, { title: "Invalid test fixture", company: "NVDA", content: "A test fixture with a stated gross margin of 66.5% for validation.", replaces: "nvda-q1", metric: { metric: "gross_margin", value: 66.5, period: "TEST", verified: false } }), /Confirm the metric/);
  assert.equal(w.sources.find(s => s.id === "nvda-q1")?.status, "active");
});
test("a multi-company query does not add unrelated companies", () => {
  const w = createWorkspace(), result = research(w.sources, "Compare Microsoft and AMD revenue");
  assert(result.evidence.length > 0);
  assert(result.evidence.every(e => ["MSFT", "AMD"].includes(w.sources.find(s => s.id === e.sourceId)!.company)));
});
test("a known company without sources cannot borrow another company's revenue", () => {
  const result = research(createWorkspace().sources, "What was Amazon revenue?");
  assert.equal(result.evidence.length, 0);
  assert(result.content.includes("couldn't find supporting evidence"));
});
