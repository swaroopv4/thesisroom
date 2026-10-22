import { getChatGPTUser } from "../../chatgpt-auth";
import { companies } from "../../../lib/types.ts";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  if (!await getChatGPTUser()) return Response.json({ error: "Please sign in." }, { status: 401 });
  const company = companies.find(c => c.ticker === new URL(request.url).searchParams.get("ticker"));
  if (!company) return Response.json({ error: "Choose NVIDIA, Microsoft, or AMD." }, { status: 400 });
  try {
    const response = await fetch(`https://data.sec.gov/submissions/CIK${company.cik}.json`, { headers: { "User-Agent": "ThesisRoom research prototype contact vveerla@uci.edu", Accept: "application/json" }, signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error("SEC declined the request. The historical research sources remain available.");
    const data = await response.json() as { name: string; filings: { recent: { form: string[]; accessionNumber: string[]; filingDate: string[]; primaryDocument: string[] } } };
    const recent = data.filings.recent;
    const filings = recent.form.map((form, i) => ({ form, filed: recent.filingDate[i], accession: recent.accessionNumber[i], url: `https://www.sec.gov/Archives/edgar/data/${Number(company.cik)}/${recent.accessionNumber[i].replaceAll("-", "")}/${recent.primaryDocument[i]}` })).filter(f => ["10-Q", "10-K", "8-K"].includes(f.form)).slice(0, 8);
    return Response.json({ company: data.name, filings, fetchedAt: new Date().toISOString() }, { headers: { "Cache-Control": "private, max-age=300" } });
  } catch (e) { return Response.json({ error: e instanceof Error ? e.message : "SEC is unavailable. Try again later." }, { status: 502 }); }
}
