export type SourceStatus = "active" | "revoked" | "superseded";
export type Fact = { metric: string; label: string; value: number; unit: string; period: string; basis: string; locator: string };
export type Source = { id: string; title: string; company: string; kind: string; published: string; period: string; url: string; content: string; status: SourceStatus; synthetic: boolean; version: number; hash: string; facts: Fact[]; addedAt: string; replaces?: string };
export type Thesis = { id: string; company: string; title: string; statement: string; metric: string; operator: "gte" | "lte"; threshold: number; unit: string; basis: string; status: "monitoring" | "review"; note: string; updatedAt: string };
export type Proposal = { id: string; thesisId: string; company: string; title: string; before: string; after: string; reason: string; sourceIds: string[]; sourceVersions: Record<string, number>; assumptionKey?: string; status: "pending" | "accepted" | "rejected" | "stale"; createdAt: string; reviewedAt?: string };
export type Evidence = { sourceId: string; title: string; excerpt: string; locator: string; score: number };
export type Message = { id: string; role: "user" | "assistant"; content: string; evidence: Evidence[]; sourceVersions: Record<string, number>; createdAt: string; mode?: string; company?: string; stale?: boolean; elapsedMs?: number };
export type Activity = { id: string; action: string; detail: string; createdAt: string; type: "source" | "research" | "review" | "evaluation" | "system" };
export type EvalCase = { id: string; category: string; name: string; passed: boolean; expected: string; actual: string; elapsedMs: number };
export type EvalRun = { id: string; createdAt: string; cases: EvalCase[]; passed: number; total: number; durationMs: number; description: string };
export type Workspace = { sources: Source[]; theses: Thesis[]; proposals: Proposal[]; messages: Message[]; activity: Activity[]; evalRuns: EvalRun[]; watchlist: string[]; version: number };
export type Company = { ticker: string; name: string; sector: string; color: string; letter: string; cik: string };
export const companies: Company[] = [
  { ticker: "NVDA", name: "NVIDIA", sector: "Semiconductors", color: "#668541", letter: "N", cik: "0001045810" },
  { ticker: "MSFT", name: "Microsoft", sector: "Cloud & software", color: "#5279b1", letter: "M", cik: "0000789019" },
  { ticker: "AMD", name: "AMD", sector: "Semiconductors", color: "#ac685b", letter: "A", cik: "0000002488" },
];
