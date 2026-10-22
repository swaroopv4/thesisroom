import type { Source, Workspace } from "./types.ts";

const stamp = "2025-05-28T20:30:00.000Z";
function source(data: Omit<Source, "hash" | "version" | "status" | "addedAt">): Source {
  return { ...data, hash: "curated-" + data.id, version: 1, status: "active", addedAt: stamp };
}
export function createWorkspace(): Workspace {
  return {
    version: 1, watchlist: ["NVDA", "MSFT", "AMD"], proposals: [], messages: [], evalRuns: [],
    sources: [
      source({ id: "nvda-q4", company: "NVDA", title: "NVIDIA · Q4 FY2025 results", kind: "Issuer release", published: "2025-02-26", period: "Q4 FY2025", synthetic: false,
        url: "https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-fourth-quarter-and-fiscal-2025",
        content: "Curated factual summary of NVIDIA's issuer release, not the full document. Q4 FY2025 ended January 26, 2025. Revenue was $39.331 billion, up 12% sequentially and 78% year over year. Data Center revenue was approximately $35.6 billion, up 93% year over year. GAAP gross margin was 73.0%; non-GAAP gross margin was 73.5%. GAAP diluted EPS was $0.89. The initial Q1 FY2026 revenue outlook was $43.0 billion, plus or minus 2%. The initial GAAP gross-margin outlook was 70.6%, plus or minus 50 basis points.",
        facts: [
          { metric: "revenue", label: "Revenue", value: 39.331, unit: "USD bn", period: "Q4 FY2025", basis: "GAAP", locator: "Q4 Fiscal 2025 Summary / Revenue" },
          { metric: "gross_margin", label: "Gross margin", value: 73, unit: "%", period: "Q4 FY2025", basis: "GAAP", locator: "Q4 Fiscal 2025 Summary / Gross margin" },
        ] }),
      source({ id: "nvda-q1", company: "NVDA", title: "NVIDIA · Q1 FY2026 results", kind: "Issuer release", published: "2025-05-28", period: "Q1 FY2026", synthetic: false,
        url: "https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-first-quarter-fiscal-2026",
        content: "Curated factual summary of NVIDIA's issuer release, not the full document. Q1 FY2026 ended April 27, 2025. Revenue was $44.062 billion, up 12% sequentially and 69% year over year. Data Center revenue was approximately $39.1 billion. GAAP gross margin was 60.5%; non-GAAP gross margin was 61.0%. An H20 inventory and purchase-obligation charge was $4.5 billion after new China export licensing requirements. Excluding that charge, non-GAAP gross margin would have been 71.3%. Q2 revenue guidance was $45.0 billion, plus or minus 2%, reflecting approximately $8.0 billion of lost H20 revenue. The exclusion figure is non-GAAP and must not be compared as if it were GAAP.",
        facts: [
          { metric: "revenue", label: "Revenue", value: 44.062, unit: "USD bn", period: "Q1 FY2026", basis: "GAAP", locator: "Q1 Fiscal 2026 Summary / Revenue" },
          { metric: "gross_margin", label: "Gross margin", value: 60.5, unit: "%", period: "Q1 FY2026", basis: "GAAP", locator: "Q1 Fiscal 2026 Summary / Gross margin" },
          { metric: "h20_charge", label: "H20 charge", value: 4.5, unit: "USD bn", period: "Q1 FY2026", basis: "GAAP", locator: "Opening results / H20 export licensing" },
        ] }),
      source({ id: "msft-q3", company: "MSFT", title: "Microsoft · Q3 FY2025 results", kind: "Issuer release", published: "2025-04-30", period: "Q3 FY2025", synthetic: false,
        url: "https://www.microsoft.com/en-us/Investor/earnings/FY-2025-Q3/press-release-webcast",
        content: "Curated factual summary of Microsoft's issuer release, not the full document. Q3 FY2025 ended March 31, 2025. Revenue was $70.066 billion, up 13% year over year as reported, or 15% in constant currency. Operating income was $32.0 billion. Microsoft Cloud revenue was $42.4 billion, up 20% as reported. Azure and other cloud services revenue grew 33% as reported and 35% in constant currency. Intelligent Cloud segment revenue was $26.751 billion. Diluted earnings per share was $3.46. Constant-currency growth is distinct from reported growth.",
        facts: [
          { metric: "revenue", label: "Revenue", value: 70.066, unit: "USD bn", period: "Q3 FY2025", basis: "GAAP", locator: "Financial Performance / Revenue" },
          { metric: "azure_growth", label: "Azure revenue growth", value: 33, unit: "% YoY", period: "Q3 FY2025", basis: "reported", locator: "Business Highlights / Intelligent Cloud" },
        ] }),
      source({ id: "amd-q1", company: "AMD", title: "AMD · Q1 2025 results", kind: "Issuer release", published: "2025-05-06", period: "Q1 2025", synthetic: false,
        url: "https://ir.amd.com/news-events/press-releases/detail/1247/amd-reports-first-quarter-2025-financial-results",
        content: "Curated factual summary of AMD's issuer release, not the full document. Q1 2025 ended March 29, 2025. Revenue was approximately $7.4 billion, up 36% year over year. GAAP gross margin was 50%; non-GAAP gross margin was 54%. GAAP operating income was $806 million, net income was $709 million, and diluted earnings per share was $0.44. Non-GAAP diluted EPS was $0.96. Q2 revenue guidance was approximately $7.4 billion, plus or minus $300 million. GAAP and non-GAAP measures are not interchangeable.",
        facts: [
          { metric: "revenue", label: "Revenue (rounded)", value: 7.4, unit: "USD bn", period: "Q1 2025", basis: "GAAP", locator: "Opening first-quarter results" },
          { metric: "revenue_growth", label: "Revenue growth", value: 36, unit: "% YoY", period: "Q1 2025", basis: "reported", locator: "CFO commentary / revenue growth" },
        ] }),
      source({ id: "sample-memo", company: "NVDA", title: "AI infrastructure · investment framework", kind: "Research note", published: "2025-02-28", period: "Sample framework", synthetic: true, url: "",
        content: "SYNTHETIC DEMONSTRATION NOTE. This is an invented investment framework, not a real fund's research or an investment recommendation. Research question: can AI infrastructure revenue growth coexist with durable profitability? Track NVIDIA's GAAP gross margin against a sample 70% floor. Track quarterly revenue against a sample $43 billion level. Separate recurring operating performance from unusual inventory charges. Review export restrictions, customer concentration, capital-spending cycles, and the difference between reported numbers and management adjustments. New evidence should trigger analyst review, not an automatic trade.", facts: [] }),
      source({ id: "sample-risk", company: "NVDA", title: "Portfolio exposure · analyst context", kind: "Research note", published: "2025-03-01", period: "Sample context", synthetic: true, url: "",
        content: "SYNTHETIC DEMONSTRATION NOTE. The fictional Northstar research team follows AI infrastructure suppliers. Analyst-only internal codeword: CEDAR-ORBIT. No real holdings, position sizes, trades, or fund data are included. The team prefers a short brief with evidence, counterarguments, and a review decision. Export restrictions are a monitoring topic, not a prediction of stock performance.", facts: [] }),
    ],
    theses: [
      { id: "margin", company: "NVDA", title: "Profitability remains durable", statement: "NVIDIA's GAAP gross margin remains at or above 70% while AI infrastructure scales.", metric: "gross_margin", operator: "gte", threshold: 70, unit: "%", basis: "GAAP", status: "monitoring", note: "Sample threshold, not investment advice. Examine unusual charges before drawing conclusions.", updatedAt: stamp },
      { id: "demand", company: "NVDA", title: "Demand supports revenue scale", statement: "NVIDIA quarterly revenue meets or exceeds $43 billion.", metric: "revenue", operator: "gte", threshold: 43, unit: "USD bn", basis: "GAAP", status: "monitoring", note: "Synthetic monitoring assumption. This is a revenue level, not a valuation or return forecast.", updatedAt: stamp },
      { id: "azure", company: "MSFT", title: "Cloud demand remains resilient", statement: "Azure and other cloud services revenue grows at least 30% year over year on a reported basis.", metric: "azure_growth", operator: "gte", threshold: 30, unit: "% YoY", basis: "reported", status: "monitoring", note: "Do not substitute constant-currency growth for reported growth.", updatedAt: stamp },
      { id: "amd-growth", company: "AMD", title: "Growth broadens across suppliers", statement: "AMD reported revenue growth remains at least 30% year over year.", metric: "revenue_growth", operator: "gte", threshold: 30, unit: "% YoY", basis: "reported", status: "monitoring", note: "Revenue growth alone does not establish AI market share or stock performance.", updatedAt: stamp },
    ],
    activity: [{ id: "welcome", action: "Research workspace created", detail: "Four linked issuer summaries and two synthetic research notes. Historical snapshot: May 28, 2025.", type: "system", createdAt: stamp }],
  };
}
