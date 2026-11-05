export type Template = "cyber" | "glass" | "hologram";

export interface Profile {
  id?: number;
  username: string;
  name: string;
  role: string;
  location: string;
  bio: string;
  template: Template;
  skills: string[];
  github?: string;
  linkedin?: string;
  website?: string;
  avatar?: string;
  available?: boolean;
  services?: string[];
  customDomain?: string;
  verified?: string[];
}

export const skillOptions = [
  "React", "TypeScript", "Python", "Security", "Product Design", "Node.js",
  "Cloudflare", "Three.js", "Data Science", "DevOps", "Figma", "AI / ML",
];

export const templates: { id: Template; name: string; description: string; accent: string }[] = [
  { id: "cyber", name: "Cyber-Ops", description: "Signal, scanlines, electric lime", accent: "#c5f467" },
  { id: "glass", name: "Minimalist Glass", description: "Quiet depth, soft chrome, clarity", accent: "#b7a3ff" },
  { id: "hologram", name: "Hologram", description: "Prismatic light, future-facing", accent: "#6de8ff" },
];
