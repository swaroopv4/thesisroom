import { env } from "cloudflare:workers";
import { createWorkspace } from "./seed.ts";
import type { Workspace } from "./types.ts";

function database() {
  if (!env.DB) throw new Error("Workspace storage is unavailable.");
  return env.DB;
}
export async function readWorkspace(userId: string) {
  const db = database();
  let row = await db.prepare("SELECT state, revision FROM workspaces WHERE user_id = ?").bind(userId).first<{ state: string; revision: number }>();
  if (!row) {
    await db.prepare("INSERT OR IGNORE INTO workspaces (user_id, state, revision, updated_at) VALUES (?, ?, 0, ?)").bind(userId, JSON.stringify(createWorkspace()), new Date().toISOString()).run();
    row = await db.prepare("SELECT state, revision FROM workspaces WHERE user_id = ?").bind(userId).first<{ state: string; revision: number }>();
  }
  if (!row) throw new Error("Workspace could not be initialized.");
  return { state: JSON.parse(row.state) as Workspace, revision: row.revision };
}
export async function writeWorkspace(userId: string, state: Workspace, revision: number) {
  const serialized = JSON.stringify(state);
  if (new TextEncoder().encode(serialized).length > 1500000) throw new Error("Workspace is full. Export your research and start a fresh demo workspace.");
  const result = await database().prepare("UPDATE workspaces SET state = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND revision = ?").bind(serialized, new Date().toISOString(), userId, revision).run();
  if (!result.meta.changes) throw new Error("Another tab updated the workspace. Refresh and try again.");
  return revision + 1;
}
