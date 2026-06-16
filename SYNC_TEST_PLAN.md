# Sync end-to-end test plan

Verify **Apple Calendar → Mac Sync Agent → My Life web app** using PocketBase as the backend. No CalDAV.

Related docs: [MAC_SYNC_AGENT.md](./MAC_SYNC_AGENT.md) · [ENVIRONMENT.md](./ENVIRONMENT.md) · [DEPLOYMENT.md](./DEPLOYMENT.md) · [apps/mac-sync-agent/README.md](./apps/mac-sync-agent/README.md)

---

## 1. PocketBase setup checklist

- [ ] PocketBase running and reachable (`curl https://pb.example.com/api/health`)
- [ ] Collections imported from [`pocketbase/pb_schema.json`](./pocketbase/pb_schema.json)
- [ ] Required collections exist: `devices`, `calendar_sources`, `calendar_events`, `pending_calendar_writes`, `sync_logs`
- [ ] Google OAuth enabled (for web UI registration)
- [ ] PocketBase superuser account created (for Next.js sync API admin client)
- [ ] HTTPS in production

---

## 2. Environment variable checklist

### Next.js (`.env.local` or Vercel)

| Variable | Required for sync | Notes |
|----------|-------------------|-------|
| `NEXT_PUBLIC_POCKETBASE_URL` | Yes | PocketBase public URL |
| `NEXT_PUBLIC_APP_URL` | Yes (prod) | Next.js canonical URL |
| `POCKETBASE_ADMIN_EMAIL` | Yes | Superuser email — sync API only |
| `POCKETBASE_ADMIN_PASSWORD` | Yes | Superuser password — sync API only |
| `NEXT_PUBLIC_SYNC_DEBUG` | No | Set `true` to show deleted events on `/calendar` |

### macOS agent

- API base URL → Settings in app (UserDefaults)
- API key → Keychain (from web registration)

**Never** put the sync API key or admin password in client-side env vars.

---

## 3. Device registration checklist

- [ ] Sign in to web app with Google
- [ ] Open **Settings → Devices**
- [ ] Click **Register Mac Sync Agent**
- [ ] Copy API key immediately (`ml_sync_<64 hex>`) — shown once
- [ ] Confirm agent appears in table with **Active** status
- [ ] Paste key into macOS agent Settings → **Save Credentials**
- [ ] Click **Test Connection** in macOS agent (or run smoke test below)

---

## 4. macOS agent setup checklist

- [ ] Build/run from `apps/mac-sync-agent` (Xcode or `xcodebuild`)
- [ ] Enter API base URL (no trailing slash), e.g. `http://localhost:3000` or production URL
- [ ] Enter and save API key
- [ ] **Test Connection** succeeds
- [ ] **Request Calendar Access** → allow in macOS prompt
- [ ] If denied: **System Settings → Privacy & Security → Calendars** → enable MyLife Sync Agent
- [ ] Select one or more Apple calendars
- [ ] Enable **Write-back** if testing outbound events
- [ ] Click **Sync Now**

---

## 5. First sync test

**Goal:** Events from selected Apple calendars appear in the web app.

### Steps

1. Create a test event in Apple Calendar on a selected calendar (within ±30/180 day window).
2. Run **Sync Now** in the macOS agent (or wait ~60s for auto sync).
3. Verify macOS menu bar shows successful last sync result.

### Web verification

| Location | Expected |
|----------|----------|
| **Settings → Devices** | Last seen updates; last sync status **Success**; calendar/event counts > 0 |
| **Settings → Calendar** | Synced sources listed with type **EventKit**; event counts > 0 |
| **Settings → Sync logs** | Entries for `calendar_sources`, `calendar_events` with success status |
| **Calendar** | Event visible in current week; **EventKit** badge on synced events |

### API smoke test (optional)

```bash
npm run smoke:sync -- \
  --base-url http://localhost:3000 \
  --api-key ml_sync_<your-key> \
  --post-calendar \
  --post-event
```

---

## 6. Deleted event test

**Goal:** Removing an event from Apple Calendar soft-deletes it in My Life.

### Steps

1. Note an event that synced successfully (title + calendar).
2. Delete the event in Apple Calendar.
3. Run **Sync Now** in the macOS agent.
4. Confirm event no longer appears on **Calendar** (normal mode).
5. Open **Settings → Sync logs** — look for `calendar_events_deleted` with count ≥ 1.

### Debug verification (optional)

Open `/calendar?debug=1` (or set `NEXT_PUBLIC_SYNC_DEBUG=true`) to show soft-deleted events with a **Deleted** badge.

---

## 7. Pending write-back test

**Goal:** A pending write from the web app creates a new Apple Calendar event.

### Prerequisites

- Write-back enabled in macOS agent
- Target calendar is writable (not read-only/subscribed)
- Calendar source already synced (same `externalId` as EventKit calendar)

### Steps

1. In PocketBase Admin (or future web UI), create a `pending_calendar_writes` record:
   - `user`: your user id
   - `device`: registered device id (optional but recommended)
   - `operation`: `create`
   - `status`: `pending`
   - `payload` (JSON):
     ```json
     {
       "title": "MyLife write-back test",
       "startsAt": "2026-06-20T15:00:00.000Z",
       "endsAt": "2026-06-20T16:00:00.000Z",
       "calendarSourceExternalId": "<EventKit calendar identifier>"
     }
     ```
2. Run **Sync Now** in macOS agent.
3. Verify new event in Apple Calendar with note **Created by MyLife**.
4. **Settings → Sync logs** → `pending_calendar_write_complete` success entry.
5. **Settings → Calendar** → event count increased for that source.

**MVP limit:** `update` and `delete` pending writes are rejected by the agent (logged as failures).

---

## 8. Failure scenarios

| Scenario | How to trigger | Expected behavior |
|----------|----------------|-------------------|
| **Invalid API key** | Wrong key in agent or smoke test | HTTP 401; agent shows auth error; Devices last sync status **Error** |
| **Revoked device** | Revoke in Settings → Devices → Confirm | HTTP 401 on next sync; agent connection error |
| **Missing admin env** | Unset `POCKETBASE_ADMIN_*` on Next.js | HTTP 503 `SERVER_MISCONFIGURED` |
| **Validation error** | POST malformed event (smoke test with bad payload) | HTTP 400 `VALIDATION_ERROR` with issues |
| **Calendar permission denied** | Deny EventKit access | Agent shows denied; no uploads |
| **Read-only calendar write-back** | Pending write to subscribed calendar | Agent reports failure via `/pending-writes/:id/fail` |
| **Unknown calendar source** | Event POST with wrong `calendarSourceExternalId` | HTTP 404 from sync API |
| **Network offline** | Disconnect Mac | Agent sync fails with network error; no partial key exposure |

---

## 9. Troubleshooting

### Agent shows 401

- Re-register at **Settings → Devices** — old keys cannot be recovered
- Confirm key format: `ml_sync_<64 hex>`
- Confirm base URL matches deployed Next.js app (not PocketBase URL)

### Agent connects but no events

- Calendar permission granted?
- Calendars selected in agent Settings?
- Test event within 30 days back / 180 days forward?
- Check **Settings → Sync logs** for errors

### Devices page shows “No sync yet”

- Agent has not completed a sync API call that writes to `sync_logs`
- Run smoke test or **Sync Now** after fixing credentials

### Events in PocketBase but not on Calendar page

- Event `startsAt` may be outside the navigated week — use week prev/next controls
- Event may be soft-deleted — check with `/calendar?debug=1`

### Write-back not creating Apple events

- Write-back toggle enabled?
- Calendar allows modifications?
- `calendarSourceExternalId` in payload matches synced source `externalId`
- Check sync logs for `pending_calendar_write_fail`

### Smoke test passes GET but POST fails

- Use `--post-calendar` before `--post-event`
- Ensure same device registered the calendar source (sources are scoped by device)

---

## 10. Observability quick reference

| UI | What it shows |
|----|----------------|
| **Settings → Devices** | Last seen, last sync status/message, calendar & event counts, revoke |
| **Settings → Calendar** | Per-source type, enabled status, last synced, event count |
| **Settings → Sync logs** | Timestamp, agent, operation, status, message, count |
| **Calendar** | Week navigation, EventKit badge, deleted events in debug mode |

---

## 11. Local vs production testing

### Local

```bash
# Terminal 1: PocketBase
./pocketbase serve

# Terminal 2: Next.js
cp .env.example .env.local
# Set NEXT_PUBLIC_POCKETBASE_URL, POCKETBASE_ADMIN_*, NEXT_PUBLIC_APP_URL=http://localhost:3000
npm run dev

# Terminal 3: Smoke test
npm run smoke:sync -- --base-url http://localhost:3000 --api-key ml_sync_...

# macOS agent: base URL http://localhost:3000
```

### Production

- Use HTTPS base URL matching `NEXT_PUBLIC_APP_URL`
- Register a production device key; do not reuse local keys across environments
- Verify Vercel env includes admin credentials
- Run smoke test against production URL from a trusted machine only

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deploy steps.
