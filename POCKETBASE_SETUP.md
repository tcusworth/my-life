# PocketBase VPS setup

Guide for running PocketBase as the backend for [My Life](https://github.com/tcusworth/my-life) on a Linux VPS.

## Architecture

```
Internet
   │
   ▼
Caddy (HTTPS :443)
   │
   ├── pb.example.com ──► PocketBase (127.0.0.1:8090)
   │
   └── app.example.com ──► Next.js (Vercel or self-hosted)

pb_data/  ← SQLite database + uploads (back up regularly)
```

The Next.js app never connects to SQLite directly — only to PocketBase over HTTPS.

---

## 1. Install PocketBase

```bash
sudo useradd --system --home /opt/pocketbase --shell /usr/sbin/nologin pocketbase
sudo mkdir -p /opt/pocketbase
cd /opt/pocketbase

# Download latest for your arch from https://pocketbase.io/docs/
wget https://github.com/pocketbase/pocketbase/releases/download/v0.27.0/pocketbase_0.27.0_linux_amd64.zip
unzip pocketbase_*.zip
rm pocketbase_*.zip

sudo chown -R pocketbase:pocketbase /opt/pocketbase
```

First run (creates `pb_data`):

```bash
sudo -u pocketbase ./pocketbase serve --http=127.0.0.1:8090
```

Open `http://YOUR_VPS_IP:8090/_/` once to create the admin account, then stop the process.

---

## 2. systemd service

Copy the example service file:

```bash
sudo cp pocketbase/deploy/pocketbase.service /etc/systemd/system/pocketbase.service
sudo systemctl daemon-reload
sudo systemctl enable pocketbase
sudo systemctl start pocketbase
sudo systemctl status pocketbase
```

Example file: [`pocketbase/deploy/pocketbase.service`](./pocketbase/deploy/pocketbase.service)

PocketBase binds to `127.0.0.1:8090` only — not exposed publicly without a reverse proxy.

---

## 3. HTTPS with Caddy

Install [Caddy](https://caddyserver.com/docs/install), then:

```bash
sudo cp pocketbase/deploy/Caddyfile.example /etc/caddy/Caddyfile
# Edit domains, then:
sudo systemctl reload caddy
```

Example: [`pocketbase/deploy/Caddyfile.example`](./pocketbase/deploy/Caddyfile.example)

Verify:

```bash
curl https://pb.example.com/api/health
# {"message":"API is healthy.","code":200,"data":{}}
```

---

## 4. Import schema

1. Open `https://pb.example.com/_/`
2. **Settings → Import collections**
3. Upload [`pocketbase/pb_schema.json`](./pocketbase/pb_schema.json)

This creates collections: `areas`, `goals`, `contacts`, `activities`, `daily_briefings`, `devices`, `projects`, `tasks`, `notes`, `calendar_*`, `time_blocks`, `pending_calendar_writes`, `sync_logs`.

If upgrading an existing instance, import may merge or conflict — prefer a fresh import on first deploy, or add new collections manually.

---

## 5. Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → OAuth 2.0 Client ID (Web application)
2. PocketBase Admin → **Settings → Auth providers → Google**
3. Copy PocketBase redirect URL into Google authorized redirect URIs
4. Paste Client ID and Secret into PocketBase
5. Enable the Google provider

Set **Settings → Application → Application URL** to your PocketBase public URL (`https://pb.example.com`).

---

## 6. Application settings

| Setting | Value |
|---------|--------|
| Application URL | `https://pb.example.com` |
| Allowed origins (if prompted) | `https://app.example.com`, `http://localhost:3000` |

---

## 7. Backup strategy

PocketBase stores everything in `pb_data/` (SQLite + files).

### Manual backup

```bash
sudo bash pocketbase/deploy/backup-pb.sh
```

### Automated daily backup (cron)

```bash
sudo install -m 755 pocketbase/deploy/backup-pb.sh /usr/local/bin/backup-pb.sh
sudo crontab -e
```

```
0 3 * * * PB_DATA_DIR=/opt/pocketbase/pb_data BACKUP_DIR=/var/backups/pocketbase /usr/local/bin/backup-pb.sh
```

### Restore

```bash
sudo systemctl stop pocketbase
sudo tar -xzf pb_data-YYYYMMDD-HHMMSS.tar.gz -C /opt/pocketbase
sudo chown -R pocketbase:pocketbase /opt/pocketbase/pb_data
sudo systemctl start pocketbase
```

**Recommendations:**
- Keep 14+ days of local backups (`RETENTION_DAYS`)
- Copy archives off-server (S3, Backblaze, another VPS)
- Test restore quarterly

---

## 8. Seed default areas

After first Google sign-in to the web app:

- **Settings → Setup → Seed default areas**

Or CLI (requires password auth on user):

```bash
POCKETBASE_URL=https://pb.example.com \
SEED_USER_EMAIL=you@example.com \
SEED_USER_PASSWORD=... \
npm run seed:areas
```

---

## 9. Security checklist

- [ ] PocketBase listens on localhost only
- [ ] Caddy terminates TLS with valid certificates
- [ ] Admin UI (`/_`) not shared publicly; use strong admin password
- [ ] Collection API rules imported from `pb_schema.json` (user-scoped)
- [ ] Firewall allows 443 (and 22 for SSH), blocks 8090 from internet
- [ ] Daily `pb_data` backups with off-site copy

---

## 10. Future: macOS EventKit sync agent

Not implemented yet. Schema includes `devices`, `calendar_sources`, `calendar_events`, and `pending_calendar_writes` for a future sync agent. No CalDAV.

Device API keys are registered in the web app under **Settings → Devices**.
