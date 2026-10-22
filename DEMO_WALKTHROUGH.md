# A two-minute ThesisRoom demonstration

ThesisRoom is an independent investment-research prototype, inspired by the category Multiplier serves. It is not affiliated with Multiplier and does not claim to reproduce its private implementation.

1. Open Overview. Explain: "This workspace connects company evidence, research assumptions, and review decisions. The starter dataset is a historical snapshot, with linked issuer disclosures and explicitly synthetic investment notes."
2. Click **Review margin changes**. The evidence engine compares NVIDIA's GAAP margins across Q4 FY2025 and Q1 FY2026, preserving the distinction between percentage points and percent changes. Explain the H20 charge context and the difference between GAAP and non-GAAP figures. Click a citation to inspect the source and open the original issuer page.
3. Open **Thesis tracker**, then **Review new evidence**. Show the 70% sample margin threshold and the proposed update. The current statement stays unchanged until **Accept update**. This is a research update, not a trade.
4. Inspect the supporting NVIDIA Q1 source and choose **Exclude from research**. Return to Research desk: the dependent answer is marked stale and the old output is withheld. Restore the source from Source library. The old answer still requires a fresh run because the evidence version changed.
5. Open **Evaluations** and run the suite. Expand a check to show its expected and observed behavior. These are deterministic software checks, not a claim of model accuracy or enterprise security.

Optional extension: add a text-based PDF or a TXT/Markdown/CSV/JSON document. For a real new disclosure, optionally enter a metric you have checked against its text, including units, period, and accounting basis. That metric can feed a new thesis review. Synthetic notes are excluded from numeric threshold checks.

Talk about your contribution precisely: source lifecycle design, typed numerical checks, user review boundaries, retrieval filtering, persistent per-user state, and evaluation. Explain which code you wrote or adapted and where AI assisted. Be prepared to trace a request from the interface to stored state.

## Current limits

- Default research uses ranked evidence extraction and typed calculations. Groq-generated drafts use a server-side credential and source citations. Without a configured provider, research uses the evidence engine; the app never labels the default engine as a live model.
- PDF import extracts selectable text, with page markers; it does not OCR scanned pages or fully reconstruct financial tables.
- The SEC connector discovers live filing metadata and links to originals. It does not automatically ingest an entire filing or connect licensed market data.
- The seeded texts are curated factual summaries, not full filings. There are no live prices, real portfolios, or execution integrations.
- Per-user account separation and source exclusion are implemented. Source exclusion is not a full enterprise entitlement system. Exports cannot be recalled.
- The JSON workspace store is deliberately bounded for a prototype. It is not a high-scale production research database.
