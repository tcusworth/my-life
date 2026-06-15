# Production deployment

Deploy **My Life** with PocketBase on a VPS and Next.js on Vercel (recommended) or self-hosted.

## Overview

| Layer | Technology | Host |
|-------|------------|------|
| Frontend | Next.js 16 | Vercel (recommended) or VPS |
| Backend + DB | PocketBase | Your VPS |
| Auth | Google OAuth via PocketBase | PocketBase Admin |
| AI inbox | OpenAI API | Server-side env on Next.js |

Detailed PocketBase VPS steps: [POCKETBASE_SETUP.md](./POCKETBASE_SETUP.md)

Environment reference: [ENVIRONMENT.md](./ENVIRONMENT.md)

---

## Recommended topology

```
Users
  │
  ├─► Vercel (Next.js)     NEXT_PUBLIC_POCKETBASE_URL ──┐
  │                                                    │
  └─► VPS Caddy HTTPS                                  ▼
         pb.example.com ──► PocketBase :8090 ──► pb_data/
```

---

## Step 1: Deploy PocketBase

Follow [POCKETBASE_SETUP.md](./POCKETBASE_SETUP.md):

1. Install PocketBase on VPS
2. Configure systemd + Caddy HTTPS
3. Import [`pocketbase/pb_schema.json`](./pocketbase/pb_schema.json)
4. Enable Google OAuth
5. Set up daily backups

Confirm health:

```bash
curl https://pb.example.com/api/health
```

---

## Step 2: Deploy Next.js to Vercel

### Connect repository

1. Import [github.com/tcusworth/my-life](https://github.com/tcusworth/my-life) in Vercel
2. Framework preset: **Next.js**
3. Root directory: `.` (default)

### Environment variables

Set in **Vercel → Project → Settings → Environment Variables** (Production + Preview):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_POCKETBASE_URL` | `https://pb.example.com` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
| `OPENAI_API_KEY` | Your OpenAI key |
| `OPENAI_MODEL` | `gpt-4o-mini` (optional) |

Deploy. Vercel runs `next build` automatically.

### Custom domain (optional)

Add `app.example.com` in Vercel → Domains, then update `NEXT_PUBLIC_APP_URL`.

---

## Step 3: Post-deploy setup

1. Visit your app URL → **Continue with Google**
2. **Settings → Setup** → **Seed default areas**
3. **Inbox** → verify green readiness alert (PocketBase + OAuth + OpenAI)
4. Paste test notes → **Extract items** → review → **Create selected**

---

## Self-hosting Next.js on VPS (alternative)

If you prefer running Next.js on the same VPS:

```bash
git clone https://github.com/tcusworth/my-life.git
cd my-life
cp .env.example .env.local
# Edit env vars

npm ci
npm run build
```

Run with systemd or PM2:

```bash
npm run start  # listens on :3000
```

Add to Caddyfile (see [`pocketbase/deploy/Caddyfile.example`](./pocketbase/deploy/Caddyfile.example)):

```
app.example.com {
    reverse_proxy 127.0.0.1:3000
}
```

---

## CI / build verification

Local production check before deploy:

```bash
npm run build
npm run start
```

GitHub Actions (optional) — add `.github/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npm run lint
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Login fails | Enable Google OAuth in PocketBase; check redirect URIs |
| Inbox shows PocketBase error | Verify `NEXT_PUBLIC_POCKETBASE_URL`, Caddy, systemd |
| Inbox shows OpenAI error | Set `OPENAI_API_KEY` on Vercel; redeploy |
| Empty extraction | Add more actionable content; check model supports JSON schema |
| CORS / cookie issues | PocketBase Application URL must match public PB URL; use HTTPS in prod |

---

## What is not deployed yet

- macOS EventKit sync agent
- CalDAV integration

Calendar data will sync once the EventKit agent is built and devices are registered under **Settings → Devices**.
