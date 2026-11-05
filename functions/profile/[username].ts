import { getProfile, json, type Env } from "../_shared";

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const username = String(params.username ?? "").toLowerCase();
  const profile = await getProfile(env.DB, username);
  if (!profile) return json({ error: "Profile not found." }, { status: 404 });
  return json({ profile });
};
