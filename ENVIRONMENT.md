# Environment variables

This document describes all environment variables used by **My Life** in development and production.

## Quick reference

| Variable | Required | Scope | Example |
|----------|----------|-------|---------|
| `NEXT_PUBLIC_POCKETBASE_URL` | Yes | Client + Server | `https://pb.example.com` |
| `NEXT_PUBLIC_APP_URL` | Production | Client + Server | `https://app.example.com` |
| `OPENAI_API_KEY` | For AI inbox | Server only | `sk-...` |
| `OPENAI_MODEL` | No | Server only | `gpt-4o-mini` |
| `POCKETBASE_ADMIN_EMAIL` | Sync API | Server only | `admin@example.com` |
| `POCKETBASE_ADMIN_PASSWORD` | Sync API | Server only | `...` |
| `NEXT_PUBLIC_SYNC_DEBUG` | Calendar UI | Client + Server | `true` |
| `SEED_USER_EMAIL` | Seed script only | CLI | `you@example.com` |
| `SEED_USER_PASSWORD` | Seed script only | CLI | `...` |
| `POCKETBASE_URL` | Seed script only | CLI | `https://pb.example.com` |

Copy [`.env.example`](../.env.example) to `.env.local` for local development.

---

## Next.js app

### `NEXT_PUBLIC_POCKETBASE_URL`

Public URL of your PocketBase instance on the VPS.

- **Development:** `http://127.0.0.1:8090` if running PocketBase locally
- **Production:** `https://pb.yourdomain.com` (HTTPS required)

Used by browser and server PocketBase clients for auth and data.

### `NEXT_PUBLIC_APP_URL`

Canonical URL of the Next.js frontend.

- **Development:** `http://localhost:3000`
- **Production:** `https://app.yourdomain.com`

Used for documentation, future OAuth redirects, and deployment checks. Set this in production even when hosting on Vercel.

### `OPENAI_API_KEY`

Server-side API key for AI inbox extraction. **Never expose to the client.**

If missing:
- Inbox shows a setup warning
- Extract action returns `MISSING_OPENAI_KEY`

### `OPENAI_MODEL`

OpenAI model for structured inbox extraction. Defaults to `gpt-4o-mini`.

Examples: `gpt-4o-mini`, `gpt-4o`

### `POCKETBASE_ADMIN_EMAIL` / `POCKETBASE_ADMIN_PASSWORD`

Server-side PocketBase superuser credentials used **only** by `/api/sync/*` routes to read/write records on behalf of authenticated sync agents. Never expose to the client or macOS agent.

If missing, sync API routes return `503 SERVER_MISCONFIGURED`.

### `NEXT_PUBLIC_SYNC_DEBUG`

When set to `true`, the **Calendar** page shows soft-deleted events (with a **Deleted** badge). You can also append `?debug=1` to `/calendar` without enabling this env var.

---

## Seed script (`npm run seed:areas`)

Run from CI or your machine to create default areas for a user.

| Variable | Description |
|----------|-------------|
| `POCKETBASE_URL` or `NEXT_PUBLIC_POCKETBASE_URL` | PocketBase base URL |
| `SEED_USER_EMAIL` | User email (Google OAuth users still have a PB user record) |
| `SEED_USER_PASSWORD` | Only if the user has password auth enabled; for Google-only users use **Settings → Setup** in the app instead |

Default areas created: CSI, OPAcommunity, Daily AI Productivity, Flatirons Creative Studio, Personal.

---

## PocketBase (VPS — not in Next.js `.env`)

Configure in PocketBase Admin or VPS environment:

| Setting | Where |
|---------|--------|
| Google OAuth Client ID / Secret | PocketBase Admin → Settings → Auth providers → Google |
| Application URL | PocketBase Admin → Settings → Application |
| SMTP (optional) | PocketBase Admin → Settings → Mail |

Google Cloud Console must list PocketBase’s OAuth redirect URL from the Auth providers screen.

---

## Vercel production example

```env
NEXT_PUBLIC_POCKETBASE_URL=https://pb.example.com
NEXT_PUBLIC_APP_URL=https://my-life.vercel.app
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

## VPS + Vercel split (recommended)

| Component | Host | Env file |
|-----------|------|----------|
| PocketBase | VPS | systemd + Caddy (see [POCKETBASE_SETUP.md](./POCKETBASE_SETUP.md)) |
| Next.js | Vercel | Vercel Project → Environment Variables |

---

## Validation in the app

The inbox page checks:

1. **PocketBase** — `GET /api/health`
2. **Google OAuth** — `GET /api/collections/users/auth-methods`
3. **OpenAI** — `OPENAI_API_KEY` present on server

Errors map to user-visible messages via [`src/lib/errors/app-errors.ts`](../src/lib/errors/app-errors.ts).
