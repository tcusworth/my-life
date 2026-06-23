"use client";
import { useState } from "react";

const avatarPalettes = [
  { bg: "#fdeee6", color: "#eb6532" },
  { bg: "#efe9f5", color: "#674197" },
  { bg: "#e9f6f7", color: "#29a8b2" },
  { bg: "#fdf4e0", color: "#f0ae35" },
  { bg: "#e7f3ec", color: "#2f8f5e" },
];

function initials(name: string) {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0][0]?.toUpperCase() ?? "?";
  return ((words[0][0] ?? "") + (words[words.length - 1][0] ?? "")).toUpperCase();
}

function formatLast(dateStr?: string): { label: string; color: string } {
  if (!dateStr) return { label: "Never", color: "#eb6532" };
  const date = new Date(dateStr.slice(0, 10) + "T12:00:00");
  const now = new Date();
  const days = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (days === 0) return { label: "Today", color: "#2f8f5e" };
  if (days <= 7) return { label: `${days}d ago`, color: "#80859a" };
  return { label: `${days}d ago`, color: "#eb6532" };
}

function isOverdue(dateStr?: string): boolean {
  if (!dateStr) return true;
  const date = new Date(dateStr.slice(0, 10) + "T12:00:00");
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  return days > 7;
}

interface Contact {
  id: string;
  name: string;
  email?: string;
  company?: string;
  notes?: string;
  followUpAt?: string;
  lastContactedAt?: string;
}

export default function PeopleClient({ contacts: initial }: { contacts: Contact[] }) {
  const [contacts, setContacts] = useState<Contact[]>(initial);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const logContact = async (id: string) => {
    const now = new Date().toISOString();
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, lastContactedAt: now } : c));
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastContactedAt: now }),
      });
      if (!res.ok) throw new Error();
      showToast("Contact logged");
    } catch {
      setContacts((prev) => prev.map((c) => c.id === id ? { ...c, lastContactedAt: initial.find((x) => x.id === id)?.lastContactedAt } : c));
      showToast("Failed to log contact");
    }
  };

  const nudgeContacts = contacts.filter((c) => isOverdue(c.lastContactedAt));

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 26 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#80859a" }}>PEOPLE</span>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 38, fontWeight: 500, letterSpacing: "-0.02em", color: "#0f1014", margin: "9px 0 0" }}>
          Stay <span style={{ fontStyle: "italic", color: "#674197" }}>connected</span>.
        </h1>
      </div>

      {/* Nudge section */}
      {nudgeContacts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#eb6532", marginBottom: 10 }}>
            Reconnect soon
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
            {nudgeContacts.slice(0, 5).map((c, i) => {
              const pal = avatarPalettes[i % avatarPalettes.length];
              const last = formatLast(c.lastContactedAt);
              return (
                <div key={c.id} style={{ background: "#ffffff", border: "1px solid #fad2bf", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, minWidth: 180 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 999, background: pal.bg, color: pal.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                    {initials(c.name)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "#15171d" }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: last.color, marginTop: 2 }}>{last.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contacts table */}
      <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 2px rgba(15,16,20,0.05)" }}>
        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 120px 2fr 90px", gap: 0, padding: "11px 20px", borderBottom: "1px solid #eceef3", background: "#faf7f1" }}>
          {["Person", "Company", "Last touch", "Notes", ""].map((h, i) => (
            <span key={i} style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#80859a" }}>{h}</span>
          ))}
        </div>

        {contacts.length === 0 && (
          <div style={{ padding: "40px 20px", textAlign: "center" as const, color: "#80859a", fontSize: 14 }}>No contacts yet.</div>
        )}

        {contacts.map((c, i) => {
          const pal = avatarPalettes[i % avatarPalettes.length];
          const last = formatLast(c.lastContactedAt);
          const isLast = i === contacts.length - 1;
          return (
            <div
              key={c.id}
              style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 120px 2fr 90px", gap: 0, padding: "14px 20px", borderBottom: isLast ? "none" : "1px solid #f5f6f9", alignItems: "center" }}
            >
              {/* Person */}
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, background: pal.bg, color: pal.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                  {initials(c.name)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#15171d" }}>{c.name}</div>
                  {c.email && <div style={{ fontSize: 12, color: "#80859a", marginTop: 1 }}>{c.email}</div>}
                </div>
              </div>

              {/* Company */}
              <div style={{ fontSize: 13.5, color: "#5b606f" }}>{c.company || <span style={{ color: "#d7dae3" }}>—</span>}</div>

              {/* Last touch */}
              <div style={{ fontSize: 13, fontWeight: 500, color: last.color }}>{last.label}</div>

              {/* Notes */}
              <div style={{ fontSize: 12.5, color: "#80859a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, paddingRight: 12 }}>
                {c.notes || <span style={{ color: "#d7dae3" }}>—</span>}
              </div>

              {/* Log button */}
              <button
                onClick={() => logContact(c.id)}
                style={{ fontSize: 12.5, fontWeight: 600, color: "#674197", background: "#efe9f5", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}
              >
                Log
              </button>
            </div>
          );
        })}
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
