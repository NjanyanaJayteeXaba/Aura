import { json, type Env } from "../_shared";

export const onRequestGet: PagesFunction<Env> = async ({ request }) => {
  const username = new URL(request.url).searchParams.get("username")?.trim();
  if (!username || !/^[a-z\d-]{1,39}$/i.test(username)) return json({ error: "Enter a valid GitHub username." }, { status: 400 });
  const headers = { "user-agent": "Aura-Portfolio", accept: "application/vnd.github+json" };
  const [userResponse, reposResponse] = await Promise.all([
    fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers }),
    fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=6`, { headers }),
  ]);
  if (!userResponse.ok) return json({ error: "GitHub profile not found." }, { status: 404 });
  const user = await userResponse.json() as { login: string; name?: string; avatar_url: string; bio?: string; location?: string; html_url: string };
  const repos = reposResponse.ok ? await reposResponse.json() as { name: string; description?: string; html_url: string; language?: string; stargazers_count: number }[] : [];
  const skills = [...new Set(repos.map((repo) => repo.language).filter((language): language is string => Boolean(language)))].slice(0, 6);
  return json({
    name: user.name || user.login,
    username: user.login,
    avatar: user.avatar_url,
    bio: user.bio || "",
    location: user.location || "",
    github: user.html_url,
    skills,
    projects: repos.map((repo) => ({ name: repo.name, description: repo.description || "", url: repo.html_url, language: repo.language, stars: repo.stargazers_count })),
  });
};
