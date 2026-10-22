import { getChatGPTUser } from "../../chatgpt-auth";
import { readWorkspace } from "../../../lib/store";
import { sanitize } from "../../../lib/core.ts";
import { env } from "cloudflare:workers";
import { modelProvider } from "../../../lib/providers.ts";

export const dynamic = "force-dynamic";
export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in to open your research workspace.", signIn: "/signin-with-chatgpt?return_to=/" }, { status: 401 });
  try {
    const { state, revision } = await readWorkspace(user.userId);
    const config = env as unknown as Record<string, string>;
    return Response.json({ state: sanitize(state), revision, user: { name: user.displayName, email: user.email }, provider: modelProvider(config) }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) { return Response.json({ error: e instanceof Error ? e.message : "Unable to load workspace." }, { status: 503 }); }
}
