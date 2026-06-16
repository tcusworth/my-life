# Mac Calendar Sync Agent API

API contract for the future **macOS Swift / EventKit menu bar agent**. The agent reads Apple Calendar locally and syncs with My Life over HTTPS. **No CalDAV.**

- **Next.js sync routes:** `{NEXT_PUBLIC_APP_URL}/api/sync/*`
- **PocketBase collections:** `devices` (sync agents), `calendar_sources`, `calendar_events`, `pending_calendar_writes`, `sync_logs`
- **Auth model:** per-agent API key (`Bearer`), stored as SHA-256 hash only

---

## Security model

| Rule | Implementation |
|------|----------------|
| API key format | `ml_sync_<64 hex chars>` (legacy `ml_<64 hex>` accepted) |
| Transport | HTTPS only in production |
| Storage | SHA-256 hash in `devices.apiKeyHash`; raw key shown once at registration |
| Header | `Authorization: Bearer <api-key>` |
| Revocation | `devices.isActive = false` rejects key |
| Scoping | All writes scoped to authenticated agent's `user` + `device` |
| Server access | Next.js uses PocketBase admin credentials; agents never get admin access |
| Logging | Inbound operations logged to `sync_logs` |
| Comparison | Invalid keys perform constant-time hash work to reduce timing leaks |

Optional header: `X-Sync-Agent-Version: 1.0.0` (updates `devices.agentVersion` and `lastSeenAt`).

---

## Device registration flow

### 1. Web UI (recommended)

1. User signs in with Google (PocketBase OAuth).
2. **Settings → Devices → Register Mac Sync Agent**
3. Copy the API key immediately — it is **never shown again**.

### 2. API registration (session auth)

Requires signed-in user cookie from the web app.

```bash
curl -X POST "https://app.example.com/api/sync/register" \
  -H "Content-Type: application/json" \
  -H "Cookie: pb_auth=..." \
  -d '{
    "name": "MacBook Pro",
    "agentVersion": "1.0.0"
  }'
```

**Response `201`:**

```json
{
  "deviceId": "abc123",
  "name": "MacBook Pro",
  "apiKey": "ml_sync_…",
  "platform": "macos",
  "message": "Store the apiKey securely — it is shown only once."
}
```

### 3. Revocation

Revoke in **Settings → Devices** or set `isActive: false` on the device record. Revoked keys receive `401 Invalid or revoked API key`.

---

## Required headers (agent endpoints)

```http
Authorization: Bearer ml_sync_<64-hex>
Content-Type: application/json
X-Sync-Agent-Version: 1.0.0
```

---

## Calendar source upload

Upserts `calendar_sources` by `(user, device, externalId)`.

```bash
curl -X POST "https://app.example.com/api/sync/calendars" \
  -H "Authorization: Bearer ml_sync_..." \
  -H "Content-Type: application/json" \
  -d '{
    "sources": [
      {
        "externalId": "EK:cal-UUID",
        "name": "Work",
        "color": "#FF5733",
        "isEnabled": true,
        "sourceType": "eventkit"
      }
    ]
  }'
```

| Field | Required | Notes |
|-------|----------|-------|
| `externalId` | Yes | EventKit calendar identifier |
| `name` | Yes | Display name |
| `color` | No | Hex or platform color string |
| `isEnabled` | No | Default `true` |
| `sourceType` | No | `eventkit` (default) or `internal` |

**Response `200`:**

```json
{
  "sources": [
    { "externalId": "EK:cal-UUID", "id": "pb_id", "action": "created" }
  ]
}
```

---

## Event upload

Upserts `calendar_events` by `(calendarSource, externalId)` for the authenticated user.

```bash
curl -X POST "https://app.example.com/api/sync/events" \
  -H "Authorization: Bearer ml_sync_..." \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {
        "calendarSourceExternalId": "EK:cal-UUID",
        "externalId": "EK:event-UUID",
        "title": "Team standup",
        "description": "Daily sync",
        "location": "Zoom",
        "startsAt": "2026-06-16T09:00:00.000Z",
        "endsAt": "2026-06-16T09:30:00.000Z",
        "isAllDay": false,
        "recurrenceRule": "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"
      }
    ]
  }'
```

Clears `deletedAt` on upsert. Sets `lastSyncedAt` to now.

---

## Deleted event reporting

Soft-deletes events by setting `deletedAt`.

```bash
curl -X POST "https://app.example.com/api/sync/events/deleted" \
  -H "Authorization: Bearer ml_sync_..." \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {
        "calendarSourceExternalId": "EK:cal-UUID",
        "externalId": "EK:event-UUID",
        "deletedAt": "2026-06-16T12:00:00.000Z"
      }
    ]
  }'
```

---

## Pending write polling

Web app enqueues outbound calendar changes in `pending_calendar_writes`. The agent polls and applies them via EventKit.

```bash
curl "https://app.example.com/api/sync/pending-writes" \
  -H "Authorization: Bearer ml_sync_..."
```

**Response `200`:**

```json
{
  "pendingWrites": [
    {
      "id": "write_id",
      "operation": "create",
      "status": "pending",
      "payload": {
        "title": "Dentist",
        "startsAt": "2026-06-20T15:00:00.000Z",
        "endsAt": "2026-06-20T16:00:00.000Z",
        "calendarSourceExternalId": "EK:cal-UUID"
      },
      "created": "2026-06-16T10:00:00.000Z",
      "updated": "2026-06-16T10:00:00.000Z"
    }
  ]
}
```

Returns writes where `status` is `pending` or `processing`, scoped to the agent's user and device (or unassigned device).

### Payload conventions

| `operation` | Agent action |
|-------------|--------------|
| `create` | Create EventKit event; report `externalId` on complete |
| `update` | Update existing EventKit event |
| `delete` | Delete EventKit event |

---

## Pending write success

```bash
curl -X POST "https://app.example.com/api/sync/pending-writes/WRITE_ID/complete" \
  -H "Authorization: Bearer ml_sync_..." \
  -H "Content-Type: application/json" \
  -d '{
    "externalId": "EK:new-event-UUID",
    "calendarEventId": "optional-existing-pb-id"
  }'
```

- Sets write `status` to `completed`
- Stores `resultExternalId` in payload
- Creates or updates linked `calendar_event` when applicable

**Response `200`:**

```json
{
  "pendingWriteId": "write_id",
  "status": "completed",
  "calendarEventId": "event_pb_id",
  "externalId": "EK:new-event-UUID"
}
```

---

## Pending write failure

```bash
curl -X POST "https://app.example.com/api/sync/pending-writes/WRITE_ID/fail" \
  -H "Authorization: Bearer ml_sync_..." \
  -H "Content-Type: application/json" \
  -d '{
    "errorMessage": "EventKit permission denied"
  }'
```

---

## Error responses

| HTTP | Code | Meaning |
|------|------|---------|
| 400 | `VALIDATION_ERROR` | Invalid payload (see `issues`) |
| 401 | `SyncAuthError` | Missing/invalid/revoked API key |
| 403 | `SyncForbiddenError` | Write belongs to another user/agent |
| 404 | `SyncNotFoundError` | Pending write or calendar source not found |
| 503 | `SERVER_MISCONFIGURED` | Missing `POCKETBASE_ADMIN_*` on server |

---

## Recommended agent sync loop

```text
every 60s (or on push notification in future):
  1. GET  /api/sync/pending-writes     → apply locally via EventKit
  2. POST /api/sync/pending-writes/:id/complete | /fail
  3. POST /api/sync/calendars          → upload local calendar list
  4. POST /api/sync/events             → upload changed events
  5. POST /api/sync/events/deleted     → report deletions
```

---

## Server configuration

Set on the Next.js host (Vercel):

```env
NEXT_PUBLIC_APP_URL=https://app.example.com
NEXT_PUBLIC_POCKETBASE_URL=https://pb.example.com
POCKETBASE_ADMIN_EMAIL=admin@example.com
POCKETBASE_ADMIN_PASSWORD=...
```

Admin credentials are used server-side only to bypass PocketBase collection rules while enforcing agent scoping in application code.

---

## Related docs

- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [POCKETBASE_SETUP.md](./POCKETBASE_SETUP.md)
- [ENVIRONMENT.md](./ENVIRONMENT.md)
