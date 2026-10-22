import { getChatGPTUser } from "../../chatgpt-auth";
import { readWorkspace, writeWorkspace } from "../../../lib/store";
import { addSource, changeSource, id, log, now, research, reviewProposal, runEvaluations, sanitize, scanTheses } from "../../../lib/core.ts";
import { createWorkspace } from "../../../lib/seed.ts";
import type { Source, Thesis } from "../../../lib/types.ts";
import { env } from "cloudflare:workers";
import { draftResearch } from "../../../lib/providers.ts";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Cross-origin writes are not permitted." }, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 180000) return Response.json({ error: "Upload is too large." }, { status: 413 });
  try {
    const body = await request.text();
    if (body.length > 180000) throw new Error("Upload is too large.");
    const data = JSON.parse(body);
    let { state, revision } = await readWorkspace(user.userId);
    if (data.revision !== undefined && data.revision !== revision) return Response.json({ error: "Another tab changed this workspace. Refresh before continuing." }, { status: 409 });
    let result: unknown = null;
    switch (data.action) {
      case "research": {
        const query = String(data.query ?? "").trim();
        if (query.length < 3 || query.length > 1800) throw new Error("Ask a question between 3 and 1,800 characters.");
        const start = performance.now();
        let answer = research(state.sources, query, String(data.company ?? "ALL"), String(data.asOf ?? "9999-12-31"));
        const config = env as unknown as Record<string, string>;
        if (data.useModel !== false) answer = await draftResearch(answer, query, config);
        answer.elapsedMs = Math.round(performance.now() - start);
        state.messages.push({ id: id(), role: "user", content: query, createdAt: now(), evidence: [], sourceVersions: {}, company: String(data.company ?? "ALL") }, answer);
        state.messages = state.messages.slice(-40);
        log(state, "Research question answered", `${query.slice(0, 120)} · ${answer.evidence.length} evidence passages · ${answer.mode}`, "research");
        result = answer;
        break;
      }
      case "addSource": result = await addSource(state, data.source ?? {}); break;
      case "sourceStatus": changeSource(state, String(data.id), String(data.status) as Source["status"]); break;
      case "scan": result = { count: scanTheses(state) }; break;
      case "review": reviewProposal(state, String(data.id), String(data.decision)); break;
      case "saveThesis": {
        const thesis = state.theses.find(t => t.id === data.thesis?.id);
        if (!thesis) throw new Error("Thesis not found.");
        const statement = String(data.thesis.statement ?? "").trim();
        const threshold = Number(data.thesis.threshold);
        if (statement.length < 10 || statement.length > 1500 || !Number.isFinite(threshold)) throw new Error("Enter a statement and a finite numeric threshold.");
        thesis.statement = statement; thesis.threshold = threshold; thesis.note = String(data.thesis.note ?? "").slice(0, 1000); thesis.updatedAt = now();
        state.proposals.filter(p => p.thesisId === thesis.id && p.status === "pending").forEach(p => { p.status = "stale"; });
        log(state, "Thesis assumption edited", `${thesis.company} · ${thesis.title}`, "review"); break;
      }
      case "addThesis": {
        const raw = data.thesis ?? {}, threshold = Number(raw.threshold);
        if (!raw.title || String(raw.statement ?? "").length < 10 || !Number.isFinite(threshold)) throw new Error("Add a title, statement, and numeric threshold.");
        if (state.theses.length >= 30) throw new Error("This workspace supports up to 30 assumptions.");
        if (!["gte", "lte"].includes(raw.operator)) throw new Error("Choose a valid threshold direction.");
        const thesis: Thesis = { id: id(), company: String(raw.company ?? "NVDA").slice(0, 12), title: String(raw.title).slice(0, 150), statement: String(raw.statement).slice(0, 1500), metric: String(raw.metric ?? "revenue"), operator: raw.operator, threshold, unit: String(raw.unit ?? "USD bn"), basis: String(raw.basis ?? "GAAP"), status: "monitoring", note: String(raw.note ?? "").slice(0, 1000), updatedAt: now() };
        state.theses.push(thesis); log(state, "Thesis assumption added", `${thesis.company} · ${thesis.title}`, "review"); break;
      }
      case "evaluate": { const run = runEvaluations(); state.evalRuns.unshift(run); state.evalRuns = state.evalRuns.slice(0, 10); log(state, "Evaluation suite completed", `${run.passed}/${run.total} software checks passed.`, "evaluation"); result = run; break; }
      case "clearResearch": state.messages = []; log(state, "Research conversation cleared", "Sources, assumptions, and audit history were preserved.", "research"); break;
      case "reset": state = createWorkspace(); log(state, "Demo workspace reset", "Restored the original historical sources and sample assumptions.", "system"); break;
      default: throw new Error("Unknown workspace action.");
    }
    revision = await writeWorkspace(user.userId, state, revision);
    return Response.json({ state: sanitize(state), revision, result }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "The operation could not be completed." }, { status: 400 });
  }
}
