import { json, slugify, validUrl, type Env } from "../_shared";

const templates = new Set(["cyber", "glass", "hologram"]);

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON body." }, { status: 400 }); }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const username = slugify(typeof body.username === "string" ? body.username : name);
  const role = typeof body.role === "string" ? body.role.trim().slice(0, 100) : "";
  const location = typeof body.location === "string" ? body.location.trim().slice(0, 100) : "";
  const bio = typeof body.bio === "string" ? body.bio.trim().slice(0, 1000) : "";
  const template = typeof body.template === "string" && templates.has(body.template) ? body.template : "cyber";
  const skills = Array.isArray(body.skills) ? [...new Set(body.skills.filter((skill): skill is string => typeof skill === "string").map((skill) => skill.trim()).filter(Boolean))].slice(0, 12) : [];
  const github = body.github ?? "", linkedin = body.linkedin ?? "", website = body.website ?? "";
  const avatar = typeof body.avatar === "string" ? body.avatar.slice(0, 500) : "";
  const available = body.available === false ? 0 : 1;
  const customDomain = typeof body.customDomain === "string" ? body.customDomain.trim().toLowerCase().slice(0, 255) : "";
  const services = Array.isArray(body.services) ? [...new Set(body.services.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean))].slice(0, 8) : [];
  const verified = Array.isArray(body.verified) ? [...new Set(body.verified.filter((item): item is string => typeof item === "string").slice(0, 5))] : [];
  if (!name || !username || !role || !skills.length || !validUrl(github) || !validUrl(linkedin) || !validUrl(website)) return json({ error: "Please provide a name, role, skill, and valid social links." }, { status: 400 });
  await env.DB.prepare("INSERT INTO users (username, name, avatar) VALUES (?, ?, ?) ON CONFLICT(username) DO UPDATE SET name = excluded.name, avatar = excluded.avatar, updated_at = datetime('now')").bind(username, name, avatar).run();
  const user = await env.DB.prepare("SELECT id FROM users WHERE username = ?").bind(username).first<{ id: number }>();
  if (!user) return json({ error: "Unable to create user." }, { status: 500 });
  await env.DB.prepare(`
    INSERT INTO profiles (user_id, role, location, bio, template, github, linkedin, website, available, custom_domain, services, verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET role=excluded.role, location=excluded.location, bio=excluded.bio, template=excluded.template, github=excluded.github, linkedin=excluded.linkedin, website=excluded.website, available=excluded.available, custom_domain=excluded.custom_domain, services=excluded.services, verified=excluded.verified, updated_at=datetime('now'), published=1
  `).bind(user.id, role, location, bio, template, github, linkedin, website, available, customDomain, services.join(","), verified.join(",")).run();
  const profile = await env.DB.prepare("SELECT id FROM profiles WHERE user_id = ?").bind(user.id).first<{ id: number }>();
  if (!profile) return json({ error: "Unable to create profile." }, { status: 500 });
  await env.DB.prepare("DELETE FROM skills WHERE profile_id = ?").bind(profile.id).run();
  for (const skill of skills) await env.DB.prepare("INSERT INTO skills (profile_id, name) VALUES (?, ?)").bind(profile.id, skill).run();
  return json({ url: `/${username}`, profile: { username, name, role, location, bio, template, github, linkedin, website, avatar, available: Boolean(available), customDomain, services, verified, skills } });
};
