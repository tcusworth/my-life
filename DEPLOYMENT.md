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
| `POCKETBASE_ADMIN_EMAIL` | PocketBase superuser email (sync API) |
| `POCKETBASE_ADMIN_PASSWORD` | PocketBase superuser password (sync API) |
| `NEXT_PUBLIC_SYNC_DEBUG` | Optional — show deleted events on `/calendar` |

Deploy. Vercel runs `next build` automatically.

See [MAC_SYNC_AGENT.md](./MAC_SYNC_AGENT.md) for macOS agent API endpoints and [SYNC_TEST_PLAN.md](./SYNC_TEST_PLAN.md) for post-deploy sync verification.

### Custom domain (optional)

Add `app.example.com` in Vercel → Domains, then update `NEXT_PUBLIC_APP_URL`.

---

## Step 3: Post-deploy setup

1. Visit your app URL → **Continue with Google**
2. **Settings → Setup** → **Seed default areas**
3. **Inbox** → verify green readiness alert (PocketBase + OAuth + OpenAI)
4. Paste test notes → **Extract items** → review → **Create selected**
5. **Settings → Devices** → register Mac sync agent → run smoke test or macOS agent
6. **Settings → Sync logs** → confirm inbound sync entries after first agent run

---

## Step 4: Verify calendar sync

### Local

```bash
npm run smoke:sync -- \
  --base-url http://localhost:3000 \
  --api-key ml_sync_<key-from-settings-devices> \
  --post-calendar \
  --post-event
```

Then run the macOS agent from `apps/mac-sync-agent/` against `http://localhost:3000`.

### Production

```bash
npm run smoke:sync -- \
  --base-url https://your-app.vercel.app \
  --api-key ml_sync_<production-key>
```

Check **Settings → Devices** (last sync status, counts), **Settings → Calendar**, and **Settings → Sync logs**.

Full checklist: [SYNC_TEST_PLAN.md](./SYNC_TEST_PLAN.md)

### Common sync errors

| HTTP | Cause | Fix |
|------|-------|-----|
| **401** | Missing, invalid, or revoked API key | Re-register at Settings → Devices |
| **403** | Resource belongs to another user/agent | Verify device id on pending writes |
| **400** | Invalid JSON or field validation | See response `issues`; match [MAC_SYNC_AGENT.md](./MAC_SYNC_AGENT.md) |
| **503** | Admin credentials missing on Next.js host | Set `POCKETBASE_ADMIN_*` on Vercel and redeploy |

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
| Sync API 401 | Revoked or wrong API key — re-register device |
| Sync API 503 | Set `POCKETBASE_ADMIN_EMAIL` / `POCKETBASE_ADMIN_PASSWORD` on Next.js host |
| No sync logs | Agent or smoke test has not hit `/api/sync/*` yet |

---

## What is not deployed yet

- CalDAV integration

Calendar data syncs via the EventKit macOS agent once devices are registered under **Settings → Devices**.
