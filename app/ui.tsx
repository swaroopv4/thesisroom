"use client";
import type { ReactNode } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { companies, type Company } from "../lib/types";
export function companyInfo(ticker: string): Company { return companies.find(c => c.ticker === ticker) ?? { ticker, name: ticker, letter: ticker[0], sector: "Custom coverage", color: "#738092", cik: "" }; }
export function formatDate(date: string, time = false) { return new Date(date.length === 10 ? date + "T12:00:00Z" : date).toLocaleDateString("en-US", { month: "short", day: "numeric", ...(time ? { hour: "numeric", minute: "2-digit" } : { year: "numeric" }) }); }
export function download(name: string, text: string, type = "application/json") { const url = URL.createObjectURL(new Blob([text], { type })); const a = document.createElement("a"); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
export function Logo({ small = false }: { small?: boolean }) { return <span className={`brand-mark ${small ? "small" : ""}`}><span /><span /><span /></span>; }
export function CompanyMark({ ticker, small = false }: { ticker: string; small?: boolean }) { const c = companyInfo(ticker); return <span className={`company-mark ${small ? "small" : ""}`} style={{ color: c.color, background: c.color + "13" }}>{c.letter}</span>; }
export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: string }) { return <span className={`badge ${tone}`}>{children}</span>; }
export function Empty({ title, body, children }: { title: string; body: string; children?: ReactNode }) { return <div className="empty"><span className="empty-icon"><BookOpen size={24} /></span><h3>{title}</h3><p>{body}</p>{children}</div>; }
export type ActionResult = { state: import("../lib/types").Workspace; revision: number; result: { count: number; id: string; passed: number; total: number }; error?: string };
export type Action = (kind: string, data?: Record<string, unknown>) => Promise<ActionResult | null>;
