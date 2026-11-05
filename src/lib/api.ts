import type { Profile } from "./types";

export async function generateAbout(payload: Pick<Profile, "name" | "role" | "skills">) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Unable to generate your introduction.");
  return (await response.json()) as { about: string };
}

export async function publishProfile(profile: Profile) {
  const response = await fetch("/api/publish", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!response.ok) throw new Error("Unable to publish your portfolio.");
  return (await response.json()) as { profile: Profile; url: string };
}

export async function importGithub(username: string) {
  const response = await fetch(`/api/github?username=${encodeURIComponent(username)}`);
  if (!response.ok) throw new Error("GitHub profile not found.");
  return (await response.json()) as {
    name: string;
    username: string;
    avatar: string;
    bio: string;
    location: string;
    github: string;
    skills: string[];
    projects: { name: string; description: string; url: string; language?: string; stars: number }[];
  };
}

export async function discoverProfiles(query = "") {
  const response = await fetch(`/api/discover?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error("Unable to load discover profiles.");
  return (await response.json()) as { profiles: Profile[] };
}
