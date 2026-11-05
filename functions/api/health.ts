import { json, type Env } from "../_shared";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const checks: { database: "ok" | "error"; ai: "configured" | "missing" } = {
    database: "error",
    ai: env.AI ? "configured" : "missing",
  };

  try {
    await env.DB.prepare("SELECT 1").first();
    checks.database = "ok";
  } catch {
    return json({ ok: false, checks, message: "D1 is not bound to this Pages environment." }, { status: 503 });
  }

  return json({ ok: checks.ai === "configured", checks });
};
