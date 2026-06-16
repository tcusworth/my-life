# MyLife Sync Agent (macOS)

Menu bar app that syncs selected **Apple Calendar** events with My Life over HTTPS using **EventKit**. No CalDAV.

## Requirements

- macOS 13.0+ (Ventura or later; macOS 14+ recommended for full EventKit access APIs)
- Xcode 15+
- A registered sync agent API key from **My Life → Settings → Mac Sync Agents**

## Build and run

1. Open the Xcode project:

   ```bash
   open apps/mac-sync-agent/MyLifeSyncAgent.xcodeproj
   ```

2. Select the **MyLifeSyncAgent** scheme and your Mac as the run destination.

3. Press **Run** (⌘R).

The app appears in the menu bar (calendar icon). It does not show in the Dock (`LSUIElement`).

### Command-line build

```bash
cd apps/mac-sync-agent
xcodebuild -scheme MyLifeSyncAgent -configuration Debug build
```

The app bundle is written under `DerivedData` or:

```bash
xcodebuild -scheme MyLifeSyncAgent -configuration Release -derivedDataPath build
open build/Build/Products/Release/MyLifeSyncAgent.app
```

## First-time setup

1. **Register an agent** in the web app at `/settings/devices` and copy the API key (`ml_sync_<64 hex>`). It is shown **once**.

2. Open **Settings** from the menu bar dropdown.

3. Enter:
   - **API base URL** — your deployed Next.js app, e.g. `https://my-life.example.com` (no trailing slash)
   - **API key** — pasted from registration

4. Click **Save Credentials**, then **Test Connection**.

5. Click **Request Calendar Access** and allow access when macOS prompts.

6. Select calendars to sync.

7. Click **Sync Now** (or wait for the automatic 60-second sync loop).

## What it syncs

| Direction | Behavior |
|-----------|----------|
| **Upload** | Selected calendars → `POST /api/sync/calendars` |
| **Upload** | Events from 30 days ago through 180 days ahead → `POST /api/sync/events` |
| **Upload** | Events missing since last sync → `POST /api/sync/events/deleted` |
| **Download** | Pending writes → `GET /api/sync/pending-writes` |
| **Write-back** | **Create only** — new Apple Calendar events for `operation: create` when write-back is enabled |

### MVP limits

- Does **not** modify existing Apple Calendar events read from EventKit.
- Does **not** delete Apple Calendar events.
- Does **not** apply pending `update` or `delete` operations (reported as failures to the server).

Write-back events include a note: `Created by MyLife`.

## API contract

See [MAC_SYNC_AGENT.md](../../MAC_SYNC_AGENT.md) at the repo root.

**Note on `sourceType`:** Apple Calendar data is sent as `sourceType: "eventkit"` per the API schema. This is the server value for EventKit-sourced calendars.

**Note on `externalId`:** EventKit `calendarIdentifier` and `eventIdentifier` are used when available. Event identifiers can change if Apple Calendar modifies an event; the agent tracks deletions by comparing snapshots between syncs.

## Security

- API key stored in **Keychain** only (never UserDefaults, never logs).
- Base URL stored in **UserDefaults**.
- Requests use `Authorization: Bearer <api-key>`.
- **Clear Credentials** removes the Keychain entry and base URL.

## Calendar permission (macOS System Settings)

If calendar access is denied or stops working:

1. Open **System Settings → Privacy & Security → Calendars**.
2. Enable **MyLife Sync Agent** (or remove and re-add by running the app and clicking **Request Calendar Access** again).
3. On macOS 14+, full calendar read access may be required; the app requests full access when available.

If the app is sandboxed (default entitlements), the **Calendars** entitlement must remain enabled in `MyLifeSyncAgent.entitlements`.

## Troubleshooting

| Symptom | What to try |
|---------|-------------|
| **401 / invalid API key** | Re-register at `/settings/devices`. Old keys cannot be recovered. |
| **403 forbidden** | Pending write may belong to another device; check server logs. |
| **Connection failed** | Verify base URL (HTTPS, reachable), no trailing slash, correct host. |
| **No calendars listed** | Grant calendar permission; restart app after changing System Settings. |
| **Write-back fails** | Target calendar must be writable (not subscribed/read-only). Pick a calendar that allows modifications. |
| **Events not updating** | Confirm calendar is selected. Sync window is 30 days back / 180 days forward only. |
| **Code signing errors** | Set your **Development Team** in Xcode target signing settings for local builds. |

### Server-side

Ensure the Next.js deployment has:

```env
POCKETBASE_ADMIN_EMAIL=...
POCKETBASE_ADMIN_PASSWORD=...
NEXT_PUBLIC_APP_URL=https://...
```

Missing admin credentials return **503 SERVER_MISCONFIGURED**.

## Project layout

```
apps/mac-sync-agent/
├── MyLifeSyncAgent.xcodeproj
├── MyLifeSyncAgent/
│   ├── MyLifeSyncAgentApp.swift   # App entry, MenuBarExtra + Settings window
│   ├── AppState.swift             # Observable app state, credentials, sync timer
│   ├── MenuBarView.swift          # Menu bar dropdown UI
│   ├── SettingsView.swift         # Settings window UI
│   ├── EventKitService.swift      # Calendar permission, read, create
│   ├── SyncClient.swift           # URLSession API client
│   ├── SyncEngine.swift           # Sync orchestration
│   ├── KeychainStore.swift        # API key storage
│   ├── Models.swift               # API + local models
│   ├── Info.plist
│   └── MyLifeSyncAgent.entitlements
└── README.md
```

## Version

Agent version `1.0.0` is sent in the `X-Sync-Agent-Version` header on every request.
