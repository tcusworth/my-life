"use client";
import { useState } from "react";

const rawNotes = [
  { id: "n1", title: "Series A — investor Q&A", folder: "Work", pinned: true, accent: "#29a8b2", updated: "2h ago", snippet: "Common questions to prep before the data room…", body: "Common questions to prep:\n\n• What's your moat? → senior craft + AI Clarity Index\n• CAC / payback? → 4.2 months\n• Why now? → the AI search shift\n• Use of funds → 4 hires, 18mo runway\n\nMaya wants the data room before Thursday." },
  { id: "n7", title: "Standup — June 16", folder: "Work", pinned: false, accent: "#29a8b2", updated: "4h ago", snippet: "Shipped onboarding copy. Blocked on design review…", body: "Shipped onboarding copy.\nBlocked on design review.\n\nToday: deck v4, design-lead interview, accountant call." },
  { id: "n3", title: "Italy trip itinerary", folder: "Family", pinned: true, accent: "#674197", updated: "2d ago", snippet: "Aug 9–23 · Rome → Florence → Amalfi…", body: "Aug 9–23\n\nRome (4 nights) → Florence (3) → Amalfi (5) → Rome (1)\n\nTODO: passports, train tickets, Amalfi hotel, dog sitter." },
  { id: "n2", title: "1:1 with Priya — agenda", folder: "Work", pinned: false, accent: "#674197", updated: "Yesterday", snippet: "Design lead pipeline, Q3 hiring, comp bands…", body: "• Design lead pipeline\n• Q3 hiring plan\n• Comp bands\n• Her bandwidth for board prep" },
  { id: "n4", title: "Marathon — race-day checklist", folder: "Health", pinned: false, accent: "#eb6532", updated: "3d ago", snippet: "Gels x6, anti-chafe, watch charged…", body: "Gels x6, anti-chafe, watch charged, bib + pins, throwaway layer, post-race bag.\n\nGoal: even splits, sub-3:30." },
  { id: "n6", title: "Home reno — contractor notes", folder: "Family", pinned: false, accent: "#674197", updated: "1w ago", snippet: "Quote $48k. Cabinets 6-wk lead time…", body: "Quote $48k. Cabinets 6-wk lead time.\nDeck: pressure-treated.\nNeed permit before demo. Tom available Fridays." },
  { id: "n5", title: "Book ideas / reading", folder: "Personal", pinned: false, accent: "#f0ae35", updated: "5d ago", snippet: "Reading: Thinking in Systems…", body: "Reading: Thinking in Systems\nNext: The Making of a Manager, Shoe Dog\nIdea: monthly 'no-meeting' deep read." },
];

const folderList = ["All", "Work", "Family", "Health", "Personal"];

export default function NotesPage() {
  const [activeNote, setActiveNote] = useState("n1");
  const [noteFolder, setNoteFolder] = useState("All");
  const [noteEdits, setNoteEdits] = useState<Record<string, string>>({});
  const [notePins, setNotePins] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const pinOf = (n: typeof rawNotes[0]) =>
    notePins[n.id] !== undefined ? notePins[n.id] : n.pinned;

  const folderCounts: Record<string, number> = {};
  rawNotes.forEach((n) => {
    folderCounts[n.folder] = (folderCounts[n.folder] || 0) + 1;
  });

  const filteredNotes =
    noteFolder === "All" ? rawNotes : rawNotes.filter((n) => n.folder === noteFolder);
  const sortedNotes = filteredNotes
    .slice()
    .sort((a, b) => (pinOf(b) ? 1 : 0) - (pinOf(a) ? 1 : 0));

  const aNote = rawNotes.find((n) => n.id === activeNote) || rawNotes[0];
  const activeBody = noteEdits[aNote.id] !== undefined ? noteEdits[aNote.id] : aNote.body;
  const activeNotePinned = pinOf(aNote);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0, background: "#faf7f1" }}>
      {/* Header */}
      <div style={{ padding: "26px 32px 16px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexShrink: 0 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#80859a" }}>SECOND BRAIN</span>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 500, letterSpacing: "-0.02em", color: "#0f1014", margin: "8px 0 0" }}>
            Everything, <span style={{ fontStyle: "italic", color: "#eb6532" }}>captured</span>.
          </h1>
        </div>
        <button
          onClick={() => showToast("New note created")}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 15px", borderRadius: 10, border: "none", background: "#0f1014", color: "#faf7f1", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New note
        </button>
      </div>

      {/* Two-pane layout */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "312px 1fr", borderTop: "1px solid #d7dae3", minHeight: 0 }}>
        {/* Left pane */}
        <div style={{ borderRight: "1px solid #d7dae3", overflowY: "auto", padding: 16 }}>
          {/* Folder filter chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {folderList.map((f) => {
              const count = f === "All" ? rawNotes.length : (folderCounts[f] || 0);
              const active = noteFolder === f;
              return (
                <span
                  key={f}
                  onClick={() => setNoteFolder(f)}
                  style={{
                    fontSize: 12, fontWeight: 500, padding: "5px 11px", borderRadius: 999,
                    background: active ? "#0f1014" : "#ffffff",
                    color: active ? "#faf7f1" : "#5b606f",
                    border: `1px solid ${active ? "#0f1014" : "#d7dae3"}`,
                    cursor: "pointer",
                  }}
                >
                  {f} {count}
                </span>
              );
            })}
          </div>

          {/* Note list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sortedNotes.map((n) => {
              const isActive = activeNote === n.id;
              const isPinned = pinOf(n);
              return (
                <div
                  key={n.id}
                  onClick={() => setActiveNote(n.id)}
                  style={{
                    position: "relative", padding: "13px 14px", borderRadius: 12,
                    background: isActive ? "#faf7f1" : "#ffffff",
                    border: "1px solid #eceef3", cursor: "pointer",
                  }}
                >
                  <span style={{ position: "absolute", left: 0, top: 11, bottom: 11, width: 3, borderRadius: "0 3px 3px 0", background: isActive ? n.accent : "transparent" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill={n.accent} stroke="none" style={{ opacity: isPinned ? 1 : 0, flexShrink: 0 }}>
                      <path d="M12 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
                    </svg>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#15171d", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.title}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#80859a", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.snippet}</div>
                  <div style={{ fontSize: 11, color: "#b3b7c6", marginTop: 6 }}>{n.folder} · {n.updated}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right pane — note editor */}
        <div style={{ overflowY: "auto", padding: "28px 36px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#80859a" }}>
                {aNote.folder} · {aNote.updated}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => showToast("AI summary added to note")}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 9, border: "1px solid #d3c4e2", background: "#efe9f5", color: "#4a2d6e", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l1.8 4.8L18 9l-4.2 1.2L12 15l-1.8-4.8L6 9z" />
                  </svg>
                  Summarize
                </button>
                <button
                  onClick={() => showToast("3 tasks sent to your inbox")}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 9, border: "1px solid #c9ebed", background: "#e9f6f7", color: "#1d7a82", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l4 4L19 7" />
                  </svg>
                  Turn into tasks
                </button>
                <button
                  onClick={() => setNotePins((p) => ({ ...p, [aNote.id]: !activeNotePinned }))}
                  style={{ width: 32, height: 32, borderRadius: 9, border: "1px solid #d7dae3", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={activeNotePinned ? "#f0ae35" : "none"} stroke="#80859a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l2.5 6.5H21l-5.2 4 2 6.5L12 15l-5.8 4 2-6.5L3 8.5h6.5z" />
                  </svg>
                </button>
              </div>
            </div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 600, letterSpacing: "-0.01em", color: "#0f1014", margin: "0 0 16px" }}>
              {aNote.title}
            </h2>
            <textarea
              value={activeBody}
              onChange={(e) => setNoteEdits((prev) => ({ ...prev, [aNote.id]: e.target.value }))}
              style={{ width: "100%", minHeight: 340, border: "none", outline: "none", resize: "none", background: "transparent", fontFamily: "inherit", fontSize: 15, lineHeight: 1.7, color: "#2c2f3a", whiteSpace: "pre-wrap", boxSizing: "border-box" }}
            />
          </div>
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
