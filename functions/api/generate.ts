import { json, type Env } from "../_shared";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: { name?: string; role?: string; skills?: string[] };
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON body." }, { status: 400 }); }
  const name = body.name?.trim();
  const role = body.role?.trim();
  const skills = Array.isArray(body.skills) ? body.skills.filter((skill): skill is string => typeof skill === "string").slice(0, 12) : [];
  if (!name || !role || !skills.length) return json({ error: "Name, role, and at least one skill are required." }, { status: 400 });
  if (!env.AI) return json({ error: "Workers AI is not configured." }, { status: 503 });
  const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
    messages: [
      { role: "system", content: "Write one polished, first-person portfolio introduction. Keep it between 45 and 65 words. No markdown, no clichés, no quotation marks." },
      { role: "user", content: `Name: ${name}\nRole: ${role}\nSkills: ${skills.join(", ")}` },
    ],
  }) as { response?: string };
  if (!result.response) return json({ error: "AI returned no text." }, { status: 502 });
  return json({ about: result.response.trim() });
};
