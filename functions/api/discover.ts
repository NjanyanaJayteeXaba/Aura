import { json, type Env } from "../_shared";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const query = new URL(request.url).searchParams.get("q")?.trim() || "";
  const pattern = `%${query}%`;
  const rows = await env.DB.prepare(`
    SELECT u.username, u.name, u.avatar, p.role, p.location, p.bio, p.template, p.github, p.linkedin,
      p.website, p.available, p.custom_domain AS customDomain, p.services, p.verified
    FROM users u JOIN profiles p ON p.user_id = u.id
    WHERE p.published = 1 AND (? = '' OR u.name LIKE ? OR p.role LIKE ? OR p.location LIKE ?)
    ORDER BY p.updated_at DESC LIMIT 30
  `).bind(query, pattern, pattern, pattern).all<Record<string, unknown>>();
  const profiles = await Promise.all(rows.results.map(async (row) => {
    const skills = await env.DB.prepare("SELECT name FROM skills WHERE profile_id = (SELECT id FROM profiles WHERE user_id = (SELECT id FROM users WHERE username = ?)) ORDER BY id LIMIT 8").bind(row.username).all<{ name: string }>();
    return { ...row, available: Boolean(row.available), verified: row.verified ? String(row.verified).split(",").filter(Boolean) : [], skills: skills.results.map((skill) => skill.name), services: row.services ? String(row.services).split(",").filter(Boolean) : [] };
  }));
  return json({ profiles });
};
