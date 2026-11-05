import { getProfile, json, slugify, type Env } from "../_shared";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!query) return json({ profile: null, suggestions: [] });
  const profiles = await env.DB.prepare(`
    SELECT u.username, u.name, p.role, p.template
    FROM users u JOIN profiles p ON p.user_id = u.id
    WHERE p.published = 1 AND (u.name LIKE ? OR u.username LIKE ?)
    LIMIT 8
  `).bind(`%${query}%`, `%${slugify(query)}%`).all();
  return json({ profile: profiles.results, suggestions: [query, `${query} — Creative Developer`, `${query} — Product Designer`] });
};
