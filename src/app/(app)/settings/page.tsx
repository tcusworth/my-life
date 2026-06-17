"use client";
import { useState, useEffect } from "react";

type TabKey = "connections" | "ai" | "calendar" | "devices" | "account" | "appearance";
type Provider = "Anthropic" | "OpenAI" | "Local";

interface ConnectionStatus {
  connected: boolean;
  email?: string;
}

interface ConnectionsState {
  google: ConnectionStatus;
}

const settingsTabs: { key: TabKey; label: string; iconPath: string }[] = [
  { key: "connections", label: "Connections", iconPath: "M4 7h16M4 12h16M4 17h10" },
  { key: "ai", label: "AI & API keys", iconPath: "M12 3l1.8 4.8L18 9l-4.2 1.2L12 15l-1.8-4.8L6 9z" },
  { key: "calendar", label: "Calendar sync", iconPath: "M3 9.5h18M8 3v4M16 3v4M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" },
  { key: "devices", label: "Devices", iconPath: "M4 5h16v10H4zM8 19h8M12 15v4" },
  { key: "account", label: "Account", iconPath: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 20a8 8 0 0 1 16 0" },
  { key: "appearance", label: "Appearance", iconPath: "M12 3a9 9 0 1 0 0 18c1.2 0 1.8-1 1.8-1.9 0-1.3 1-1.9 1.9-1.9h1.1a3 3 0 0 0 3-3 9 9 0 0 0-9-9z" },
];

const iCloudSources = [
  { name: "iCloud — Personal", count: "3 calendars" },
  { name: "iCloud — Work", count: "2 calendars" },
];

const devices = [
  { name: "Trevor's MacBook Pro", sub: "macOS sync agent · v1.2.0", status: "Syncing", statusColor: "#2f8f5e", statusBg: "#e7f3ec", last: "2 min ago" },
  { name: "iPhone 15 Pro", sub: "iOS app · v1.1.4", status: "Connected", statusColor: "#1d7a82", statusBg: "#e9f6f7", last: "1 hr ago" },
];

const accentSwatches = [
  { name: "Teal", c: "#29a8b2" },
  { name: "Orange", c: "#eb6532" },
  { name: "Amber", c: "#f0ae35" },
  { name: "Purple", c: "#674197" },
];

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ width: 40, height: 24, borderRadius: 999, background: on ? "#29a8b2" : "#d7dae3", border: "none", cursor: "pointer", position: "relative", transition: "background 160ms", padding: 0, flexShrink: 0 }}
    >
      <span style={{ position: "absolute", top: 3, left: on ? 19 : 3, width: 18, height: 18, borderRadius: 999, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 160ms" }} />
    </button>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("connections");
  const [showKey, setShowKey] = useState(false);
  const [provider, setProvider] = useState<Provider>("Anthropic");
  const [toggles, setToggles] = useState({ sync: true, notify: true, autoExtract: true, weekly: false, motion: false });
  const [sourceOn, setSourceOn] = useState<Record<number, boolean>>({ 0: true, 1: true });
  const [selectedAccent, setSelectedAccent] = useState("Orange");
  const [toast, setToast] = useState<string | null>(null);
  const [connections, setConnections] = useState<ConnectionsState>({
    google: { connected: false },
  });
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/auth/connections")
      .then((r) => r.json())
      .then((data) => setConnections(data))
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const toggleSwitch = (k: keyof typeof toggles) => {
    setToggles((prev) => ({ ...prev, [k]: !prev[k] }));
  };

  const toggleSource = (i: number) => {
    setSourceOn((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  const handleSync = async (providerKey: "google") => {
    setSyncing((s) => ({ ...s, [providerKey]: true }));
    try {
      const endpoint = "/api/sync/google-calendar";
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        showToast(`Synced ${data.synced?.events ?? 0} events from Google Calendar`);
      } else {
        showToast("Sync failed. Try again.");
      }
    } catch {
      showToast("Sync failed. Try again.");
    } finally {
      setSyncing((s) => ({ ...s, [providerKey]: false }));
    }
  };

  const handleDisconnect = async (providerKey: "google") => {
    const endpoint = "/api/auth/google/disconnect";
    await fetch(endpoint, { method: "POST" });
    setConnections((c) => ({ ...c, [providerKey]: { connected: false } }));
    showToast("Google Calendar disconnected");
  };

  const apiKeyDisplay = showKey ? "sk-ant-api03-7f3c9a2b8e1d4f6a0c5b9e2d3a" : "•".repeat(28);

  const providerCardStyle = {
    flex: 1,
    border: "1px solid #d7dae3",
    borderRadius: 14,
    padding: 20,
    background: "#faf7f1",
    display: "flex",
    flexDirection: "column" as const,
    gap: 14,
  };

  return (
    <div style={{ padding: 32, maxWidth: 1080, margin: "0 auto", background: "#faf7f1", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#80859a" }}>SYSTEM</span>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 34, fontWeight: 500, letterSpacing: "-0.02em", color: "#0f1014", margin: "9px 0 0" }}>
          Configure <span style={{ fontStyle: "italic", color: "#eb6532" }}>My Life</span>.
        </h1>
        <p style={{ fontSize: 15, color: "#5b606f", margin: "9px 0 0" }}>Connections, AI keys, calendar sync, and devices in one place.</p>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "212px 1fr", gap: 28, alignItems: "start" }}>
        {/* Left nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {settingsTabs.map((t) => {
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 11,
                  padding: "10px 12px", borderRadius: 11, border: "none",
                  background: active ? "#0f1014" : "transparent",
                  color: active ? "#faf7f1" : "#2c2f3a",
                  fontFamily: "inherit", fontSize: 13.5, fontWeight: 500,
                  cursor: "pointer", textAlign: "left", transition: "background 160ms",
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d={t.iconPath} />
                </svg>
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Right content */}
        <div>
          {/* Connections tab */}
          {activeTab === "connections" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* PocketBase card */}
              <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, boxShadow: "0 1px 2px rgba(15,16,20,0.05)", padding: 24 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, color: "#0f1014", margin: 0 }}>PocketBase</h3>
                    <p style={{ fontSize: 13, color: "#80859a", margin: "5px 0 0" }}>Your self-hosted data backend.</p>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#2f8f5e", background: "#e7f3ec", padding: "5px 11px", borderRadius: 999, flexShrink: 0 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 999, background: "#2f8f5e" }} />
                    Connected
                  </span>
                </div>
                <div style={{ height: 1, background: "#f5f6f9", margin: "18px 0" }} />
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#80859a", marginBottom: 7 }}>Instance URL</label>
                <input defaultValue="https://pb.mylife.app" style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: "1px solid #d7dae3", background: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: 13.5, color: "#15171d", outline: "none", boxSizing: "border-box" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#80859a", marginBottom: 7 }}>Admin email</label>
                    <input defaultValue="trevor@mylife.app" style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: "1px solid #d7dae3", background: "#fff", fontFamily: "inherit", fontSize: 14, color: "#15171d", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#80859a", marginBottom: 7 }}>Region</label>
                    <input defaultValue="us-west · Fly.io" style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: "1px solid #d7dae3", background: "#fff", fontFamily: "inherit", fontSize: 14, color: "#15171d", outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button onClick={() => showToast("Connected to PocketBase ✓")} style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid #d7dae3", background: "#fff", color: "#2c2f3a", fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Test connection</button>
                  <button onClick={() => showToast("Settings saved")} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#0f1014", color: "#faf7f1", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save changes</button>
                </div>
              </div>

              {/* Calendar OAuth cards */}
              <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, boxShadow: "0 1px 2px rgba(15,16,20,0.05)", padding: 24 }}>
                <div style={{ marginBottom: 18 }}>
                  <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, color: "#0f1014", margin: 0 }}>Calendar connections</h3>
                  <p style={{ fontSize: 13, color: "#80859a", margin: "5px 0 0" }}>Connect Google to sync events.</p>
                </div>
                <div style={{ display: "flex", gap: 14 }}>
                  {/* Google Calendar card */}
                  <div style={providerCardStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 11, background: "#fff", border: "1px solid #e8eaed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="3" width="18" height="18" rx="2" fill="#4285F4" />
                          <rect x="3" y="3" width="9" height="9" fill="#EA4335" />
                          <rect x="12" y="12" width="9" height="9" fill="#34A853" />
                          <rect x="3" y="12" width="9" height="9" fill="#FBBC05" />
                          <rect x="7" y="7" width="10" height="10" rx="1" fill="#fff" />
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#0f1014" }}>Google Calendar</div>
                        {connections.google.connected && connections.google.email && (
                          <div style={{ fontSize: 12, color: "#80859a", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{connections.google.email}</div>
                        )}
                      </div>
                      {connections.google.connected ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: "#2f8f5e", background: "#e7f3ec", padding: "4px 10px", borderRadius: 999, flexShrink: 0 }}>
                          <span style={{ width: 6, height: 6, borderRadius: 999, background: "#2f8f5e" }} />
                          Connected
                        </span>
                      ) : (
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: "#b3b7c6", background: "#f5f6f9", padding: "4px 10px", borderRadius: 999, flexShrink: 0 }}>
                          Not connected
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {connections.google.connected ? (
                        <>
                          <button
                            onClick={() => handleSync("google")}
                            disabled={syncing.google}
                            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 14px", borderRadius: 9, border: "none", background: "#0f1014", color: "#faf7f1", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: syncing.google ? "default" : "pointer", opacity: syncing.google ? 0.7 : 1 }}
                          >
                            {syncing.google ? <Spinner /> : null}
                            {syncing.google ? "Syncing…" : "Sync now"}
                          </button>
                          <button
                            onClick={() => handleDisconnect("google")}
                            style={{ padding: "9px 14px", borderRadius: 9, border: "1px solid #f3c9c5", background: "#fff", color: "#c94339", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                          >
                            Disconnect
                          </button>
                        </>
                      ) : (
                        <a
                          href="/api/auth/google"
                          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 14px", borderRadius: 9, border: "1px solid #d7dae3", background: "#fff", color: "#2c2f3a", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "none" }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                          Connect Google
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI & API keys tab */}
          {activeTab === "ai" && (
            <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, boxShadow: "0 1px 2px rgba(15,16,20,0.05)", padding: 24 }}>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, color: "#0f1014", margin: 0 }}>AI provider</h3>
              <p style={{ fontSize: 13, color: "#80859a", margin: "5px 0 16px" }}>Powers inbox extraction, daily briefings, and Ask AI.</p>
              <div style={{ display: "flex", gap: 7, marginBottom: 20 }}>
                {(["Anthropic", "OpenAI", "Local"] as Provider[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setProvider(p)}
                    style={{
                      flex: 1, padding: 10, borderRadius: 10,
                      border: `1px solid ${provider === p ? "#15171d" : "#d7dae3"}`,
                      background: provider === p ? "#15171d" : "#ffffff",
                      color: provider === p ? "#ffffff" : "#5b606f",
                      fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 140ms",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#80859a", marginBottom: 7 }}>API key</label>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, padding: "11px 13px", borderRadius: 10, border: "1px solid #d7dae3", background: "#f5f6f9", fontFamily: "'JetBrains Mono', monospace", fontSize: 13.5, color: "#2c2f3a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{apiKeyDisplay}</div>
                <button onClick={() => setShowKey((v) => !v)} style={{ padding: "0 14px", borderRadius: 10, border: "1px solid #d7dae3", background: "#fff", color: "#2c2f3a", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                  {showKey ? "Hide" : "Reveal"}
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#80859a", marginBottom: 7 }}>Model</label>
                  <input defaultValue="claude-sonnet-4-5" style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: "1px solid #d7dae3", background: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: 13.5, color: "#15171d", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#80859a", marginBottom: 7 }}>Monthly budget</label>
                  <input defaultValue="$50.00" style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: "1px solid #d7dae3", background: "#fff", fontFamily: "inherit", fontSize: 14, color: "#15171d", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ height: 1, background: "#f5f6f9", margin: "20px 0" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#15171d" }}>Auto-extract from inbox</div>
                  <div style={{ fontSize: 12.5, color: "#80859a", marginTop: 2 }}>Run extraction automatically on new captures.</div>
                </div>
                <Toggle on={toggles.autoExtract} onClick={() => toggleSwitch("autoExtract")} />
              </div>
            </div>
          )}

          {/* Calendar sync tab */}
          {activeTab === "calendar" && (
            <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, boxShadow: "0 1px 2px rgba(15,16,20,0.05)", padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, color: "#0f1014", margin: 0 }}>iCloud / macOS sync</h3>
                  <p style={{ fontSize: 13, color: "#80859a", margin: "5px 0 0" }}>Events sync from your Mac via the EventKit agent.</p>
                </div>
                <Toggle on={toggles.sync} onClick={() => toggleSwitch("sync")} />
              </div>
              <div style={{ height: 1, background: "#f5f6f9", margin: "18px 0" }} />
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#80859a", marginBottom: 12 }}>Sources</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {iCloudSources.map((src, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "#15171d" }}>{src.name}</div>
                      <div style={{ fontSize: 12.5, color: "#80859a", marginTop: 1 }}>{src.count}</div>
                    </div>
                    <Toggle on={!!sourceOn[i]} onClick={() => toggleSource(i)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Devices tab */}
          {activeTab === "devices" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, boxShadow: "0 1px 2px rgba(15,16,20,0.05)", padding: 24 }}>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, color: "#0f1014", margin: "0 0 16px" }}>Connected devices</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {devices.map((dv, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 13, padding: 14, border: "1px solid #eceef3", borderRadius: 13 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f5f6f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#5b606f" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" />
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#15171d" }}>{dv.name}</div>
                        <div style={{ fontSize: 12.5, color: "#80859a", marginTop: 1 }}>{dv.sub}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: dv.statusColor, background: dv.statusBg, padding: "3px 9px", borderRadius: 999 }}>{dv.status}</span>
                        <div style={{ fontSize: 11.5, color: "#b3b7c6", marginTop: 4 }}>{dv.last}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, boxShadow: "0 1px 2px rgba(15,16,20,0.05)", padding: 24 }}>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, color: "#0f1014", margin: "0 0 4px" }}>Register a new sync agent</h3>
                <p style={{ fontSize: 13, color: "#80859a", margin: "0 0 14px" }}>Paste this token into the macOS agent to pair a device.</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1, padding: "11px 13px", borderRadius: 10, border: "1px solid #d7dae3", background: "#f5f6f9", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#2c2f3a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    mls_dev_8KQ2p9LmXr4TaZ0wNe6V
                  </div>
                  <button onClick={() => showToast("Device token copied")} style={{ padding: "0 16px", borderRadius: 10, border: "none", background: "#0f1014", color: "#faf7f1", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>Copy</button>
                </div>
              </div>
            </div>
          )}

          {/* Account tab */}
          {activeTab === "account" && (
            <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, boxShadow: "0 1px 2px rgba(15,16,20,0.05)", padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: 13, background: "linear-gradient(135deg,#29a8b2,#674197)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: 600, flexShrink: 0 }}>TC</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#0f1014" }}>Trevor Cusworth</div>
                  <div style={{ fontSize: 13, color: "#80859a" }}>Pro workspace · since 2024</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#80859a", marginBottom: 7 }}>Full name</label>
                  <input defaultValue="Trevor Cusworth" style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: "1px solid #d7dae3", background: "#fff", fontFamily: "inherit", fontSize: 14, color: "#15171d", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#80859a", marginBottom: 7 }}>Email</label>
                  <input defaultValue="trevor@mylife.app" style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: "1px solid #d7dae3", background: "#fff", fontFamily: "inherit", fontSize: 14, color: "#15171d", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ height: 1, background: "#f5f6f9", margin: "20px 0" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#15171d" }}>Weekly review email</div>
                  <div style={{ fontSize: 12.5, color: "#80859a", marginTop: 2 }}>A Sunday digest of progress and what&apos;s ahead.</div>
                </div>
                <Toggle on={toggles.weekly} onClick={() => toggleSwitch("weekly")} />
              </div>
              <div style={{ height: 1, background: "#f5f6f9", margin: "20px 0" }} />
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => showToast("Settings saved")} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#0f1014", color: "#faf7f1", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save changes</button>
                <button style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid #f3c9c5", background: "#fff", color: "#c94339", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Sign out</button>
              </div>
            </div>
          )}

          {/* Appearance tab */}
          {activeTab === "appearance" && (
            <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, boxShadow: "0 1px 2px rgba(15,16,20,0.05)", padding: 24 }}>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, color: "#0f1014", margin: 0 }}>Accent color</h3>
              <p style={{ fontSize: 13, color: "#80859a", margin: "5px 0 16px" }}>Also editable live from the Tweaks panel.</p>
              <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                {accentSwatches.map((sw) => (
                  <div key={sw.name} style={{ textAlign: "center" }} onClick={() => setSelectedAccent(sw.name)}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: sw.c, boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${selectedAccent === sw.name ? sw.c : "#d7dae3"}`, cursor: "pointer" }} />
                    <div style={{ fontSize: 11.5, color: "#5b606f", marginTop: 7 }}>{sw.name}</div>
                  </div>
                ))}
              </div>
              <div style={{ height: 1, background: "#f5f6f9", margin: "20px 0" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#15171d" }}>Reduce motion</div>
                  <div style={{ fontSize: 12.5, color: "#80859a", marginTop: 2 }}>Minimize animations and transitions.</div>
                </div>
                <Toggle on={toggles.motion} onClick={() => toggleSwitch("motion")} />
              </div>
              <div style={{ height: 1, background: "#f5f6f9", margin: "20px 0" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#15171d" }}>Desktop notifications</div>
                  <div style={{ fontSize: 12.5, color: "#80859a", marginTop: 2 }}>Reminders, conflicts, and follow-up nudges.</div>
                </div>
                <Toggle on={toggles.notify} onClick={() => toggleSwitch("notify")} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 70, display: "flex", alignItems: "center", gap: 10, background: "#0f1014", color: "#faf7f1", padding: "12px 18px", borderRadius: 12, boxShadow: "0 18px 40px -16px rgba(15,16,20,0.5)", fontSize: 13.5, fontWeight: 500 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5fd0aa" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4L19 7" /></svg>
          {toast}
        </div>
      )}
    </div>
  );
}
