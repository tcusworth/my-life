# My Life

Personal AI productivity web app built with Next.js and PocketBase.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS** + **shadcn/ui**
- **PocketBase** on your VPS (auth, database, API)
- **Google OAuth** via PocketBase

Calendar sync uses the **macOS EventKit sync agent** in `apps/mac-sync-agent/` — no CalDAV or direct Apple Calendar API in this app. See [MAC_SYNC_AGENT.md](./MAC_SYNC_AGENT.md) for the sync API contract and [SYNC_TEST_PLAN.md](./SYNC_TEST_PLAN.md) for end-to-end testing.

**Deployment:** [DEPLOYMENT.md](./DEPLOYMENT.md) · [POCKETBASE_SETUP.md](./POCKETBASE_SETUP.md) · [ENVIRONMENT.md](./ENVIRONMENT.md)

## Getting started

### 1. PocketBase on your VPS

Install and run [PocketBase](https://pocketbase.io/docs/) on your VPS. Note the public URL (e.g. `https://pb.example.com`).

### 2. Import collections

In PocketBase Admin → **Settings** → **Import collections**, upload:

```
pocketbase/pb_schema.json
```

This creates all app collections including `areas`, `goals`, `contacts`, `activities`, `daily_briefings`, `devices`, `projects`, `tasks`, `notes`, `calendar_sources`, `calendar_events`, `time_blocks`, `pending_calendar_writes`, and `sync_logs`, and extends the `users` auth collection with a `timezone` field.

**Note:** If you already imported an earlier schema, re-import the updated `pb_schema.json` or add the new collections manually in PocketBase Admin.

### 3. Configure Google OAuth

1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/).
2. Add the PocketBase OAuth redirect URL from **PocketBase Admin → Settings → Auth providers → Google**.
3. Enable the Google provider in PocketBase with your Client ID and Secret.

### 4. Web app

```bash
cp .env.example .env.local
# Set NEXT_PUBLIC_POCKETBASE_URL to your VPS PocketBase URL

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with Google.

### 5. AI inbox processing

Set `OPENAI_API_KEY` in `.env.local` to enable inbox extraction on `/inbox`. Paste unstructured text and the app will create tasks, projects, contacts, areas, and follow-ups automatically.

## Routes

| Route | Description |
|-------|-------------|
| `/dashboard` | Widgets: goals, projects, tasks, follow-ups, calendar |
| `/inbox` | AI inbox processing + inbox tasks |
| `/today` | Tasks and time blocks for today |
| `/projects` | Project list |
| `/calendar` | Week view and events (EventKit badge; debug mode for deleted) |
| `/settings/setup` | Seed default areas |
| `/settings/devices` | Register Mac sync agents, sync status |
| `/settings/calendar` | Calendar sources from EventKit sync |
| `/settings/sync-logs` | Sync API activity log |

## Mac sync agent

The macOS EventKit menu bar agent (`apps/mac-sync-agent/`):

1. Authenticates with a device API key (registered under **Settings → Devices**).
2. Pushes calendar sources and events to PocketBase via `/api/sync/*`.
3. Polls `pending_calendar_writes` for outbound calendar changes.

Device API keys are stored as SHA-256 hashes. Sync routes validate `Authorization: Bearer <api-key>` server-side using PocketBase admin credentials.

### Test sync locally

```bash
# PocketBase + Next.js running (see Getting started)
npm run dev

# Register agent at http://localhost:3000/settings/devices
npm run smoke:sync -- \
  --base-url http://localhost:3000 \
  --api-key ml_sync_<your-key> \
  --post-calendar \
  --post-event
```

Run the macOS agent with base URL `http://localhost:3000`. Full checklist: [SYNC_TEST_PLAN.md](./SYNC_TEST_PLAN.md).

### Test against production

Use your deployed `NEXT_PUBLIC_APP_URL`, a production-registered API key, and HTTPS. Set `POCKETBASE_ADMIN_*` on Vercel before testing.

### Common sync API errors

| HTTP | Meaning | Fix |
|------|---------|-----|
| 401 | Invalid or revoked API key | Re-register device; update agent key |
| 403 | Write scoped to another user/device | Check pending write ownership |
| 400 | Validation error | Inspect `issues` in response body |
| 404 | Calendar source or pending write not found | Sync calendars first; verify external IDs |
| 503 | `SERVER_MISCONFIGURED` | Set `POCKETBASE_ADMIN_EMAIL` and `POCKETBASE_ADMIN_PASSWORD` |

## Project structure

```
src/
├── app/
│   ├── (auth)/login/       # Google OAuth login
│   └── (app)/              # Authenticated app shell
├── components/             # UI, sidebar, providers
├── lib/pocketbase/         # Browser + server PocketBase clients
└── types/pocketbase.ts     # Collection TypeScript types
pocketbase/
└── pb_schema.json          # Importable PocketBase schema
```

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
npm run test:sync   # Sync API validation unit tests
npm run smoke:sync  # Sync API smoke test (see SYNC_TEST_PLAN.md)
```
