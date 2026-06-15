# My Life

Personal AI productivity web app built with Next.js and PocketBase.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS** + **shadcn/ui**
- **PocketBase** on your VPS (auth, database, API)
- **Google OAuth** via PocketBase

Calendar sync uses a future **macOS EventKit sync agent** — no CalDAV or direct Apple Calendar API in this app.

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
| `/calendar` | Week view and events |
| `/settings/devices` | Register Mac sync agents |
| `/settings/calendar` | Calendar sources from EventKit sync |

## Device sync agent (future)

The macOS EventKit sync agent will:

1. Authenticate with a device API key (registered under **Settings → Devices**).
2. Push calendar sources and events to PocketBase.
3. Poll `pending_calendar_writes` for outbound calendar changes.

Device API keys are stored as SHA-256 hashes. A custom PocketBase hook route will validate `Authorization: Bearer <api-key>` against `devices.apiKeyHash` — not implemented in this foundation.

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
```
