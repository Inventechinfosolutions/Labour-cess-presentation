# Inventech demos

All Inventech demo sites live in this repo and deploy together as one Cloudflare Worker, `inventech-demos`.

| Folder | URL path | Type |
|---|---|---|
| `labour-cess/` | `/labour-cess/` | Vite + React presenter deck |
| `global-connect/` | `/global-connect/` | Vite + React site |
| `KSIC/` | `/ksic/` | Static HTML designs |
| `home/` | `/` | Landing page that lists every demo |

## Work on one demo

```bash
cd labour-cess && npm install && npm run dev
```

KSIC needs no build. Open `KSIC/index.html` in a browser.

## Build and deploy everything

```bash
npm run build     # builds every demo into dist/
npm run preview   # serves dist/ locally with Cloudflare's runtime
npm run deploy    # builds and deploys to Cloudflare
```

## Access

The whole site is private (`worker/`):

- **Admin** signs in at `/login` and sees every demo. `/admin` lists each demo's share link and 6-digit PIN.
- **Clients** open a demo's link and enter its PIN. A PIN unlocks only that one demo.
- To change a demo's PIN, raise its `pinVersion` in `worker/demos.js` and deploy.

Set three secrets on the Worker (Cloudflare dashboard → Worker → Settings → Variables and Secrets, type **Secret**): `ADMIN_USER`, `ADMIN_PASSWORD`, `AUTH_SECRET` (a long random string, e.g. `openssl rand -hex 32`). Changing `AUTH_SECRET` signs everyone out and changes every PIN. For local preview, copy `.dev.vars.example` to `.dev.vars`.

## Add a new demo

1. Add the demo in its own folder.
2. Register it in `scripts/build.mjs`. Vite apps go in `VITE_APPS` and static sites go in `STATIC_SITES`.
3. Vite apps must set `base: process.env.DEMO_BASE ?? "/"` (or `"./"` for hash-routed apps) and load public files through `import.meta.env.BASE_URL`, not from `/`.
4. Add it to `DEMOS` in `worker/demos.js` (set `spa: true` if it uses browser routes instead of hash routes).
5. Add a card to `DEMOS` in `home/index.html`, with a preview image in `home/previews/`.
