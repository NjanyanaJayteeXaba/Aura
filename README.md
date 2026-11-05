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

If your Pages project specifically requires a deploy command, use `npm run deploy` instead. Do not enter `npx wrangler deploy`.

### Connect D1 and Workers AI

1. In Cloudflare, open **Workers & Pages → D1 → Create database**, name it `aura-db`, and copy its database ID.
2. Open **Workers & Pages → Pages → your Aura project → Settings → Functions → Bindings**.
3. Add a **D1 database** binding with variable name `DB`, selecting `aura-db`.
4. Add a **Workers AI** binding with variable name `AI`.
5. Apply the schema from the repository using `npm run db:migrate:remote` after authenticating with `npx wrangler login`. The command applies both migrations in `migrations/`.
6. After redeployment, open `/api/health`. It should return `{"ok":true,"checks":{"database":"ok","ai":"configured"}}`.

For local development, run `npm run db:migrate:local`, then use `npm run pages:dev` instead of `npm run dev` so Pages Functions and bindings are emulated. Set the real D1 ID in `wrangler.toml` only for Wrangler-based local/manual workflows; the Pages dashboard binding is the source of truth for Git deployments.

The schema is in `migrations/0001_init.sql` and `migrations/0002_growth_features.sql`. Functions provide `GET /api/health`, `GET /api/search`, `GET /api/github?username=...`, `GET /api/discover`, `POST /api/generate`, `POST /api/publish`, and `GET /profile/:username`.

## Growth features

- GitHub profile and repository import through the Pages Function proxy.
- Availability status, services, custom domain field, verification badges, share links, and QR codes.
- Discover page with search by name, role, and location.
- Custom domains require adding the domain in Cloudflare Pages and pointing its DNS CNAME to the Pages target; Aura stores the preferred domain on the profile.