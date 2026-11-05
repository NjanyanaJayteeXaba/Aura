export interface Env {
  DB: D1Database;
  AI: Ai;
}

export interface ProfileRecord {
  username: string;
  name: string;
  role: string;
  location: string;
  bio: string;
  template: "cyber" | "glass" | "hologram";
  github: string;
  linkedin: string;
  website: string;
  skills: string[];
  avatar?: string;
  available?: boolean;
  services?: string[];
  customDomain?: string;
  verified?: string[];
}

export function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json; charset=utf-8", ...init.headers },
  });
}

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

export function validUrl(value: unknown) {
  return typeof value === "string" && value.length <= 500 && (value === "" || /^https?:\/\/[^\s]+$/i.test(value));
}

export async function getProfile(db: D1Database, username: string): Promise<ProfileRecord | null> {
  const row = await db.prepare(`
    SELECT u.username, u.name, u.avatar, p.role, p.location, p.bio, p.template, p.github, p.linkedin, p.website,
      p.available, p.custom_domain AS customDomain, p.services, p.verified
    FROM users u JOIN profiles p ON p.user_id = u.id
    WHERE u.username = ? AND p.published = 1
  `).bind(username).first<Omit<ProfileRecord, "skills">>();
  if (!row) return null;
  const skills = await db.prepare("SELECT name FROM skills WHERE profile_id = (SELECT id FROM profiles WHERE user_id = (SELECT id FROM users WHERE username = ?)) ORDER BY id").bind(username).all<{ name: string }>();
  return { ...row, available: Boolean(row.available), verified: row.verified ? String(row.verified).split(",").filter(Boolean) : [], services: row.services ? String(row.services).split(",").filter(Boolean) : [], skills: skills.results.map((skill) => skill.name) };
}
