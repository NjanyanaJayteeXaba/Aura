import { useEffect, useMemo, useState } from "react";
import { Background } from "./components/Background";
import { GlassPanel } from "./components/GlassPanel";
import { Logo } from "./components/Logo";
import { OrbitalPreview } from "./components/OrbitalPreview";
import { PublicScene } from "./components/PublicScene";
import { discoverProfiles, generateAbout, importGithub, publishProfile } from "./lib/api";
import { skillOptions, templates, type Profile, type Template } from "./lib/types";

type View = "landing" | "builder" | "public" | "about" | "terms" | "discover" | "settings";
type Theme = "dark" | "light";

const starterProfile: Profile = {
  username: "",
  name: "",
  role: "Creative Developer",
  location: "",
  bio: "",
  template: "cyber",
  skills: ["React", "TypeScript", "Three.js"],
  github: "",
  linkedin: "",
  website: "",
  available: true,
  services: ["Frontend development", "Creative technology"],
  verified: [],
};

function App() {
  const [view, setView] = useState<View>(() => {
    const path = window.location.pathname.replace(/^\/+/, "");
    return path === "about" || path === "terms" || path === "discover" || path === "settings" ? path : "landing";
  });
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("aura-theme") as Theme) || "dark");
  const [splash, setSplash] = useState(true);
  const [query, setQuery] = useState("");
  const [profile, setProfile] = useState<Profile>(starterProfile);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setSplash(false), 1450);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
    if (!path || path === "about" || path === "terms") return;
    fetch(`/profile/${encodeURIComponent(path)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Profile not found");
        return response.json() as Promise<{ profile: Profile }>;
      })
      .then((result) => {
        setProfile(result.profile);
        setView("public");
      })
      .catch(() => {
        window.history.replaceState({}, "", "/");
      });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("aura-theme", theme);
  }, [theme]);

  const navigate = (nextView: View) => {
    setView(nextView);
    if (nextView === "landing") window.history.pushState({}, "", "/");
    if (nextView === "about" || nextView === "terms") window.history.pushState({}, "", `/${nextView}`);
    if (nextView === "discover") window.history.pushState({}, "", "/discover");
    if (nextView === "settings") window.history.pushState({}, "", "/settings");
  };

  const signOut = () => {
    setProfile(starterProfile);
    setQuery("");
    setNotice("");
    navigate("landing");
  };

  const handleClaim = () => {
    const name = query.trim();
    if (!name) return;
    setProfile((current) => ({ ...current, name, username: slugify(name) }));
    setView("builder");
  };

  const handlePublish = async () => {
    setLoading(true);
    setNotice("");
    try {
      const result = await publishProfile(profile);
      setProfile(result.profile);
      setView("public");
      window.history.replaceState({}, "", `/${result.profile.username}`);
    } catch {
      setNotice("Publishing is unavailable in preview mode. Your profile is ready to preview locally.");
      setView("public");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setNotice("");
    try {
      const result = await generateAbout(profile);
      setProfile((current) => ({ ...current, bio: result.about }));
    } catch {
      setProfile((current) => ({ ...current, bio: fallbackBio(current) }));
      setNotice("AI preview used — connect Workers AI to generate a custom version.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background theme={theme}>
      {splash && <Splash />}
      {view === "landing" && <Landing query={query} setQuery={setQuery} onClaim={handleClaim} onNavigate={navigate} theme={theme} onThemeChange={setTheme} />}
      {view === "builder" && <Builder profile={profile} setProfile={setProfile} onGenerate={handleGenerate} onPublish={handlePublish} loading={loading} notice={notice} theme={theme} onThemeChange={setTheme} />}
      {view === "public" && <PublicProfile profile={profile} onEdit={() => setView("builder")} notice={notice} theme={theme} onThemeChange={setTheme} />}
      {view === "about" && <About onNavigate={navigate} theme={theme} onThemeChange={setTheme} />}
      {view === "terms" && <Terms onNavigate={navigate} theme={theme} onThemeChange={setTheme} />}
      {view === "discover" && <Discover onNavigate={navigate} theme={theme} onThemeChange={setTheme} />}
      {view === "settings" && <Settings profile={profile} onNavigate={navigate} onSignOut={signOut} theme={theme} onThemeChange={setTheme} />}
    </Background>
  );
}

function Splash() {
  return <div className="splash-screen"><div className="splash-logo"><span className="logo-mark"><span /></span><strong>aura<span>.</span></strong></div><div className="splash-loader"><i /><i /><i /></div><p>shape your signal</p></div>;
}

function ThemeToggle({ theme, onChange }: { theme: Theme; onChange: (theme: Theme) => void }) {
  return <button className="theme-toggle" onClick={() => onChange(theme === "dark" ? "light" : "dark")} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}><span>{theme === "dark" ? "☼" : "☾"}</span><small>{theme === "dark" ? "Light" : "Dark"}</small></button>;
}

function Header({ action, onNavigate, theme, onThemeChange }: { action?: React.ReactNode; onNavigate?: (view: View) => void; theme?: Theme; onThemeChange?: (theme: Theme) => void }) {
  return <header className="site-header"><button className="logo-button" onClick={() => onNavigate?.("landing")}><Logo /></button><nav className="site-nav"><button onClick={() => onNavigate?.("discover")}>Discover</button><button onClick={() => onNavigate?.("about")}>About</button><button onClick={() => onNavigate?.("terms")}>Terms</button>{theme && onThemeChange && <ThemeToggle theme={theme} onChange={onThemeChange} />}<button className="settings-link" onClick={() => onNavigate?.("settings")} aria-label="Open settings">⚙ <span>Settings</span></button></nav><div className="header-right">{action ?? <span className="eyebrow">Portfolio generator <i /></span>}</div></header>;
}

function PageFooter({ onNavigate }: { onNavigate: (view: View) => void }) {
  return <footer className="platform-footer"><span>© {new Date().getFullYear()} aura.</span><span><button onClick={() => onNavigate("about")}>About & credits</button><button onClick={() => onNavigate("terms")}>Terms & privacy</button></span></footer>;
}

function Landing({ query, setQuery, onClaim, onNavigate, theme, onThemeChange }: { query: string; setQuery: (value: string) => void; onClaim: () => void; onNavigate: (view: View) => void; theme: Theme; onThemeChange: (theme: Theme) => void }) {
  return (
    <main className="landing">
      <Header onNavigate={onNavigate} theme={theme} onThemeChange={onThemeChange} />
      <section className="hero-grid">
        <div className="hero-copy">
          <div className="eyebrow reveal">3D portfolio generator <i /></div>
          <h1 className="hero-title reveal delay-one">Your work,<br /><em>in another</em><br />dimension.</h1>
          <p className="hero-subtitle reveal delay-two">A portfolio that moves at the speed of your ideas.<br className="desktop-only" /> Claim your name and make your work impossible to forget.</p>
          <form className="claim-form reveal delay-three" onSubmit={(event) => { event.preventDefault(); onClaim(); }}>
            <label htmlFor="name">Search your name to claim your portfolio</label>
            <div className="input-wrap"><span className="input-icon">⌕</span><input id="name" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. Jaytee Xaba" /><button type="submit" aria-label="Claim portfolio">↗</button></div>
            <span className="form-note"><span className="status-dot" /> No credit card. Your name is your URL.</span>
          </form>
        </div>
        <div className="hero-art"><OrbitalPreview /><div className="art-label label-one">01 / identity</div><div className="art-label label-two">move with intent <span>↗</span></div></div>
      </section>
      <div className="landing-footer"><span>scroll to explore <b>↓</b></span><span>built for people who build what’s next <b>✳</b></span></div>
      <PageFooter onNavigate={onNavigate} />
    </main>
  );
}

function About({ onNavigate, theme, onThemeChange }: { onNavigate: (view: View) => void; theme: Theme; onThemeChange: (theme: Theme) => void }) {
  return <main className="info-page"><Header onNavigate={onNavigate} theme={theme} onThemeChange={onThemeChange} /><section className="info-content"><div className="eyebrow">The signal behind Aura <i /></div><h1>Built for <em>the next.</em></h1><p className="info-lede">Aura is a creative toolkit for turning your work, skills, and point of view into a portfolio people can feel.</p><div className="info-grid"><GlassPanel><span className="info-number">01</span><h2>Make an entrance</h2><p>We give independent builders a fast, expressive starting point — no templates that look like everyone else.</p></GlassPanel><GlassPanel><span className="info-number">02</span><h2>Keep your signal</h2><p>Your name becomes your link. Your skills become an orbit. Your story stays yours.</p></GlassPanel><GlassPanel><span className="info-number">03</span><h2>Credits</h2><p>Designed and engineered by <strong>Jaytee Xaba</strong> with React, Three.js, Cloudflare, and a love for strange little details.</p></GlassPanel></div><button className="publish-button" onClick={() => onNavigate("landing")}>Create your aura <span>↗</span></button></section><PageFooter onNavigate={onNavigate} /></main>;
}

function Terms({ onNavigate, theme, onThemeChange }: { onNavigate: (view: View) => void; theme: Theme; onThemeChange: (theme: Theme) => void }) {
  return <main className="info-page"><Header onNavigate={onNavigate} theme={theme} onThemeChange={onThemeChange} /><section className="terms-content"><div className="eyebrow">Clear by design <i /></div><h1>Terms & <em>privacy.</em></h1><p className="info-lede">The short version: use Aura to share work you own, be honest about who you are, and treat other people’s data with care.</p><div className="terms-copy"><h2>Using Aura</h2><p>You are responsible for the content and links you publish. Do not upload unlawful, harmful, misleading, or abusive material. We may remove content that puts the platform or other people at risk.</p><h2>Your information</h2><p>Aura stores the profile details you provide so your public portfolio can work. We do not sell your personal information. Remove or update your profile through the builder or contact the project owner.</p><h2>Third-party services</h2><p>Hosting, database, and AI generation may be provided by Cloudflare. Generated copy should be reviewed by you before publishing; you remain responsible for your final portfolio.</p><p className="terms-date">Last updated: November 5, 2026</p></div><button className="text-button back-button" onClick={() => onNavigate("landing")}>← Back home</button></section><PageFooter onNavigate={onNavigate} /></main>;
}

function Settings({ profile, onNavigate, onSignOut, theme, onThemeChange }: { profile: Profile; onNavigate: (view: View) => void; onSignOut: () => void; theme: Theme; onThemeChange: (theme: Theme) => void }) {
  const [confirm, setConfirm] = useState(false);
  const profileUrl = `${window.location.origin}/${profile.username || "your-name"}`;
  return <main className="settings-page"><Header onNavigate={onNavigate} theme={theme} onThemeChange={onThemeChange} /><section className="settings-content"><div className="eyebrow">Control room <i /></div><h1>Your <em>settings.</em></h1><p className="info-lede">Manage your Aura preferences and profile access from one place.</p><div className="settings-grid"><GlassPanel><span className="info-number">ACCOUNT</span><h2>Profile access</h2><p className="setting-value">{profile.name || "Unclaimed profile"}</p><small>{profile.username ? profileUrl : "Claim a name to create your public link."}</small><div className="setting-actions"><button className="settings-action" onClick={() => onNavigate("builder")}>Edit profile <span>↗</span></button><button className="settings-action" onClick={() => navigator.clipboard?.writeText(profileUrl)}>Copy link <span>⌘</span></button></div></GlassPanel><GlassPanel><span className="info-number">PREFERENCES</span><h2>Appearance</h2><p>Choose how Aura looks on this device.</p><div className="appearance-options"><button className={theme === "dark" ? "selected" : ""} onClick={() => onThemeChange("dark")}>☾ Dark mode</button><button className={theme === "light" ? "selected" : ""} onClick={() => onThemeChange("light")}>☼ Light mode</button></div></GlassPanel><GlassPanel><span className="info-number">SESSION</span><h2>Sign out</h2><p>There is no account login connected in this preview yet. This action clears the local profile draft and returns to the landing page.</p>{confirm ? <div className="confirm-actions"><button className="danger-button" onClick={onSignOut}>Confirm exit</button><button className="settings-action" onClick={() => setConfirm(false)}>Cancel</button></div> : <button className="danger-button" onClick={() => setConfirm(true)}>Sign out / exit <span>↗</span></button>}</GlassPanel></div><button className="text-button back-button" onClick={() => onNavigate("landing")}>← Back home</button></section><PageFooter onNavigate={onNavigate} /></main>;
}

function ShareButton({ username, customDomain }: { username: string; customDomain?: string }) {
  const [open, setOpen] = useState(false);
  const url = `${window.location.origin}/${username}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(customDomain ? `https://${customDomain}` : url)}`;
  return <div className="share-wrap"><button className="share-button" onClick={() => setOpen(!open)}>Share profile <span>↗</span></button>{open && <div className="share-popover"><img src={qrUrl} alt="QR code for this Aura profile" /><button onClick={() => navigator.clipboard?.writeText(customDomain ? `https://${customDomain}` : url)}>Copy link</button><small>{customDomain || url}</small></div>}</div>;
}

function Discover({ onNavigate, theme, onThemeChange }: { onNavigate: (view: View) => void; theme: Theme; onThemeChange: (theme: Theme) => void }) {
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    discoverProfiles(query).then((result) => setProfiles(result.profiles)).catch(() => setProfiles([])).finally(() => setLoading(false));
  }, [query]);
  return <main className="discover-page"><Header onNavigate={onNavigate} theme={theme} onThemeChange={onThemeChange} /><section className="discover-content"><div className="eyebrow">Find your people <i /></div><h1>Discover <em>the signal.</em></h1><p className="info-lede">Explore public Auras by role, skill, and point of view.</p><div className="discover-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search designers, developers, locations..." /></div>{loading ? <p className="notice">Loading the network...</p> : profiles.length ? <div className="discover-grid">{profiles.map((item) => <button className="discover-card" key={item.username} onClick={() => { window.history.pushState({}, "", `/${item.username}`); window.location.reload(); }}><div className="discover-card-top">{item.avatar ? <img src={item.avatar} alt="" /> : <span className="avatar-fallback">{item.name.slice(0, 1)}</span>}<span className="verified-mini">{item.verified?.length ? "✓ verified" : "aura member"}</span></div><h2>{item.name}</h2><p>{item.role}{item.location && ` · ${item.location}`}</p><div>{item.skills.slice(0, 4).map((skill) => <span key={skill}>{skill}</span>)}</div><strong>{item.available ? "Available for work ↗" : "View profile ↗"}</strong></button>)}</div> : <GlassPanel className="empty-discover"><span className="info-number">THE NETWORK IS WARMING UP</span><h2>Be one of the first signals.</h2><p>Publish your Aura and your profile will appear here for people looking for your skills.</p><button className="publish-button" onClick={() => onNavigate("landing")}>Create your aura <span>↗</span></button></GlassPanel>}</section><PageFooter onNavigate={onNavigate} /></main>;
}

function Builder({ profile, setProfile, onGenerate, onPublish, loading, notice, theme, onThemeChange }: { profile: Profile; setProfile: React.Dispatch<React.SetStateAction<Profile>>; onGenerate: () => void; onPublish: () => void; loading: boolean; notice: string; theme: Theme; onThemeChange: (theme: Theme) => void }) {
  const update = (patch: Partial<Profile>) => setProfile((current) => ({ ...current, ...patch }));
  const toggleSkill = (skill: string) => update({ skills: profile.skills.includes(skill) ? profile.skills.filter((item) => item !== skill) : [...profile.skills, skill] });
  const [githubName, setGithubName] = useState("");
  const [importing, setImporting] = useState(false);
  const importProfile = async () => {
    if (!githubName.trim()) return;
    setImporting(true);
    try {
      const imported = await importGithub(githubName.trim());
      update({ name: imported.name || profile.name, username: imported.username, avatar: imported.avatar, bio: imported.bio || profile.bio, location: imported.location || profile.location, github: imported.github, verified: [...new Set([...(profile.verified ?? []), "GitHub"])], skills: [...new Set([...profile.skills, ...imported.skills])] });
    } catch { /* The form remains editable when GitHub is unavailable. */ }
    finally { setImporting(false); }
  };
  return (
    <main className="app-shell">
      <Header action={<button className="text-button" onClick={() => window.location.reload()}>Exit builder <span>×</span></button>} theme={theme} onThemeChange={onThemeChange} />
      <div className="builder-heading"><div><div className="eyebrow">Build your aura <i /></div><h1>Make it <em>yours.</em></h1></div><div className="step-count">02 <span>/ 03</span></div></div>
      <div className="builder-layout">
        <section className="builder-form">
          <GlassPanel>
            <div className="section-title"><span>01</span><div><h2>The essentials</h2><p>Give people a reason to remember you.</p></div></div>
            <div className="field-grid"><Field label="Your name" value={profile.name} onChange={(value) => update({ name: value, username: slugify(value) })} /><Field label="Role / title" value={profile.role} onChange={(value) => update({ role: value })} /><Field label="Location (optional)" value={profile.location} onChange={(value) => update({ location: value })} /></div>
            <div className="field"><label htmlFor="bio">About you</label><textarea id="bio" value={profile.bio} onChange={(event) => update({ bio: event.target.value })} placeholder="What do you make? What do you care about?" rows={4} /><button className="ai-button" onClick={onGenerate} disabled={loading}><span>✦</span>{loading ? "Thinking..." : "Generate with Aura AI"}</button></div>
          </GlassPanel>
          <GlassPanel>
            <div className="section-title"><span>02A</span><div><h2>Import from GitHub</h2><p>Start with your real work, not a blank page.</p></div></div>
            <div className="import-row"><input value={githubName} onChange={(event) => setGithubName(event.target.value)} placeholder="GitHub username" /><button className="ai-button" onClick={importProfile} disabled={importing}>{importing ? "Importing..." : "Import profile"} <span>↗</span></button></div>
          </GlassPanel>
          <GlassPanel>
            <div className="section-title"><span>02</span><div><h2>Your signals</h2><p>Pick the skills that feel like you.</p></div><span className="selected-count">{profile.skills.length} selected</span></div>
            <div className="skill-list">{skillOptions.map((skill) => <button key={skill} className={`skill-pill ${profile.skills.includes(skill) ? "selected" : ""}`} onClick={() => toggleSkill(skill)}>{profile.skills.includes(skill) ? "✓" : "+"} {skill}</button>)}</div>
          </GlassPanel>
          <GlassPanel>
            <div className="section-title"><span>05</span><div><h2>Work & availability</h2><p>Make it clear how people can work with you.</p></div></div>
            <button className={`availability-toggle ${profile.available ? "active" : ""}`} onClick={() => update({ available: !profile.available })}><span>{profile.available ? "●" : "○"}</span>{profile.available ? "Available for new opportunities" : "Not currently available"}</button>
            <div className="service-list">{(profile.services ?? []).map((service) => <span key={service}>{service}<button onClick={() => update({ services: profile.services?.filter((item) => item !== service) })}>×</button></span>)}</div>
            <input className="service-input" placeholder="Add a service and press Enter" onKeyDown={(event) => { if (event.key === "Enter" && event.currentTarget.value.trim()) { update({ services: [...(profile.services ?? []), event.currentTarget.value.trim()] }); event.currentTarget.value = ""; } }} />
          </GlassPanel>
          <GlassPanel>
            <div className="section-title"><span>06</span><div><h2>Custom address</h2><p>Connect a domain you own after publishing.</p></div></div>
            <Field label="Custom domain (optional)" value={profile.customDomain ?? ""} onChange={(value) => update({ customDomain: value })} placeholder="you.com" />
            <p className="domain-note">Point your domain's CNAME to <strong>cname.aura.pages.dev</strong> in your DNS provider.</p>
          </GlassPanel>
          <GlassPanel>
            <div className="section-title"><span>03</span><div><h2>Choose your atmosphere</h2><p>Every template is built to move.</p></div></div>
            <div className="template-list">{templates.map((template) => <button key={template.id} className={`template-card ${profile.template === template.id ? "active" : ""}`} onClick={() => update({ template: template.id })}><span className="template-orb" style={{ background: template.accent }} /><span><strong>{template.name}</strong><small>{template.description}</small></span><b>{profile.template === template.id ? "✓" : "○"}</b></button>)}</div>
          </GlassPanel>
          <GlassPanel>
            <div className="section-title"><span>04</span><div><h2>Connect your orbit</h2><p>Let people find more of your work.</p></div></div>
            <div className="field-grid links-grid"><Field label="GitHub URL" value={profile.github ?? ""} onChange={(value) => update({ github: value })} placeholder="github.com/..." /><Field label="LinkedIn URL" value={profile.linkedin ?? ""} onChange={(value) => update({ linkedin: value })} placeholder="linkedin.com/in/..." /></div>
          </GlassPanel>
          {notice && <p className="notice">{notice}</p>}
          <button className="publish-button" onClick={onPublish} disabled={loading}>{loading ? "Publishing..." : "Publish my aura"} <span>↗</span></button>
        </section>
        <aside className="builder-preview"><div className="preview-label"><span>Live preview</span><span className="live-dot">● live</span></div><div className="preview-window"><PublicScene skills={profile.skills} template={profile.template} /><div className="preview-copy"><span className="preview-kicker">aura / {profile.username || "your-name"}</span><h3>{profile.name || "Your name"}<br /><em>{profile.role}</em></h3><div className="preview-line" /></div></div><p className="preview-tip">Move your cursor to explore <span>✦</span></p></aside>
      </div>
    </main>
  );
}

function PublicProfile({ profile, onEdit, notice, theme, onThemeChange }: { profile: Profile; onEdit: () => void; notice: string; theme: Theme; onThemeChange: (theme: Theme) => void }) {
  const socials = useMemo(() => [{ label: "GH", href: profile.github }, { label: "in", href: profile.linkedin }, { label: "↗", href: profile.website }].filter((social) => social.href), [profile]);
  return (
    <main className={`public-page theme-${profile.template}`}>
      <Header action={<button className="text-button" onClick={onEdit}>Edit aura <span>↗</span></button>} theme={theme} onThemeChange={onThemeChange} />
      <PublicScene skills={profile.skills} template={profile.template} />
      <div className="public-content"><div className="public-kicker">aura / {profile.username}</div><h1>{profile.name}</h1><p className="public-role">{profile.role}{profile.location && ` · ${profile.location}`}</p><div className={`availability-badge ${profile.available ? "active" : ""}`}>{profile.available ? "● Available for work" : "○ Not currently available"}</div><GlassPanel className="about-panel"><div className="panel-kicker">01 / about</div><p>{profile.bio || fallbackBio(profile)}</p></GlassPanel>{profile.services?.length ? <div className="public-services"><span className="panel-kicker">02 / services</span><div>{profile.services.map((service) => <span key={service}>{service}</span>)}</div></div> : null}<div className="public-skills">{profile.skills.map((skill) => <span key={skill}>{skill}</span>)}</div><div className="verified-row">{profile.verified?.map((item) => <span key={item}>✓ {item} verified</span>)}</div><div className="public-actions"><div className="socials">{socials.map((social) => <a key={social.label} href={ensureProtocol(social.href!)} target="_blank" rel="noreferrer">{social.label}</a>)}</div><ShareButton username={profile.username} customDomain={profile.customDomain} /></div></div>
      {notice && <div className="public-notice">{notice}</div>}
      <div className="public-footer"><span>© {new Date().getFullYear()} {profile.name}</span><span>made with <strong>aura.</strong></span></div>
    </main>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <div className="field"><label>{label}</label><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></div>;
}
function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function ensureProtocol(value: string) { return value.startsWith("http") ? value : `https://${value}`; }
function fallbackBio(profile: Pick<Profile, "name" | "role" | "skills">) { return `${profile.name} is a ${profile.role.toLowerCase()} who turns thoughtful ideas into useful, expressive digital experiences. With a toolkit spanning ${profile.skills.slice(0, 3).join(", ")}, they build with curiosity, care, and a bias toward what is next.`; }

export default App;
