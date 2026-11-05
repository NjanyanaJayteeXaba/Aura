# Aura

Aura is a mobile-first 3D portfolio generator built with Vite, React, React Three Fiber, and Cloudflare Pages.

## Local development

```bash
npm install
npm run dev
```

The UI includes a local preview fallback when Pages Functions are not running. To connect Cloudflare:

1. Create a D1 database and put its ID in `wrangler.toml`.
2. Run `npx wrangler d1 migrations apply aura-db --local` for local data, or use `--remote` for production.
3. Configure the Pages project with the `DB` D1 binding and `AI` Workers AI binding.
4. In **Cloudflare Pages > Settings > Builds & deployments**, use:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/`
   - **Deploy command:** **Leave empty**
5. To deploy manually, run `npm run deploy:pages`.

Cloudflare Pages performs deployment itself after the build. Do **not** use `npx wrangler deploy`; that command deploys a Worker and expects a Worker entry point. Aura is a Pages site and must use `wrangler pages deploy`.

If your Pages project specifically requires a deploy command, use `npm run deploy` instead. Add the `DB` D1 binding and `AI` Workers AI binding under **Pages → Settings → Functions → Bindings**, then apply the D1 migrations to the same database used by the Pages project.

The schema is in `migrations/0001_init.sql` and `migrations/0002_growth_features.sql`. Functions provide `GET /api/search`, `GET /api/github?username=...`, `GET /api/discover`, `POST /api/generate`, `POST /api/publish`, and `GET /profile/:username`.

## Growth features

- GitHub profile and repository import through the Pages Function proxy.
- Availability status, services, custom domain field, verification badges, share links, and QR codes.
- Discover page with search by name, role, and location.
- Custom domains require adding the domain in Cloudflare Pages and pointing its DNS CNAME to the Pages target; Aura stores the preferred domain on the profile.