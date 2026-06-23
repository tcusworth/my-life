"use client";

import { useState, useCallback } from "react";

interface Project { id: string; name: string; color?: string; }
interface Note {
  id: string;
  project?: string;
  title: string;
  content?: string;
  created: string;
  updated: string;
  expand?: { project?: Project };
}

interface Props {
  notes: Note[];
  projects: Project[];
}

function formatUpdated(dateStr: string): string {
  const d = new Date(dateStr.slice(0, 10) + "T12:00:00");
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" } as Intl.DateTimeFormatOptions);
}

function snippet(content?: string): string {
  if (!content) return "No content";
  return content.slice(0, 72) + (content.length > 72 ? "…" : "");
}

const ACCENT_COLORS = ["#29a8b2", "#674197", "#eb6532", "#f0ae35", "#2f8f5e", "#4a6eb5"];

function accentForProject(projectId?: string, projects?: Project[]): string {
  if (!projectId || !projects) return "#29a8b2";
  const idx = projects.findIndex((p) => p.id === projectId);
  return ACCENT_COLORS[idx % ACCENT_COLORS.length] || "#29a8b2";
}

export default function NotesClient({ notes: initialNotes, projects }: Props) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(initialNotes[0]?.id || null);
  const [projectFilter, setProjectFilter] = useState("All");
  const [editContent, setEditContent] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  const filterOptions = ["All", ...projects.map((p) => p.name)];

  const filteredNotes = projectFilter === "All"
    ? notes
    : notes.filter((n) => n.expand?.project?.name === projectFilter);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0] || null;
  const activeContent = activeNote
    ? (editContent[activeNote.id] !== undefined ? editContent[activeNote.id] : (activeNote.content || ""))
    : "";

  const handleContentChange = (val: string) => {
    if (!activeNote) return;
    setEditContent((prev) => ({ ...prev, [activeNote.id]: val }));
  };

  const handleSave = async () => {
    if (!activeNote || editContent[activeNote.id] === undefined) return;
    setSaving(true);
    try {
      await fetch(`/api/notes/${activeNote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent[activeNote.id] }),
      });
      setNotes((ns) => ns.map((n) => n.id === activeNote.id ? { ...n, content: editContent[activeNote.id] } : n));
      setEditContent((prev) => { const p = { ...prev }; delete p[activeNote.id]; return p; });
      showToast("Note saved");
    } catch {
      showToast("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleNewNote = async () => {
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled", content: "" }),
      });
      const newNote = await res.json();
      setNotes((ns) => [newNote, ...ns]);
      setActiveNoteId(newNote.id);
      showToast("New note created");
    } catch {
      showToast("Failed to create note");
    }
  };

  const handleDelete = async () => {
    if (!activeNote) return;
    if (!confirm(`Delete "${activeNote.title}"?`)) return;
    try {
      await fetch(`/api/notes/${activeNote.id}`, { method: "DELETE" });
      const remaining = notes.filter((n) => n.id !== activeNote.id);
      setNotes(remaining);
      setActiveNoteId(remaining[0]?.id || null);
      showToast("Note deleted");
    } catch {
      showToast("Failed to delete");
    }
  };

  const isDirty = activeNote && editContent[activeNote.id] !== undefined;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0, background: "#faf7f1" }}>
      {/* Header */}
      <div style={{ padding: "26px 32px 16px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexShrink: 0 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#80859a" }}>
            SECOND BRAIN · {notes.length} NOTE{notes.length !== 1 ? "S" : ""}
          </span>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 500, letterSpacing: "-0.02em", color: "#0f1014", margin: "8px 0 0" }}>
            Everything, <span style={{ fontStyle: "italic", color: "#eb6532" }}>captured</span>.
          </h1>
        </div>
        <button
          onClick={handleNewNote}
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
          {/* Project filter chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {filterOptions.map((f) => {
              const count = f === "All" ? notes.length : notes.filter((n) => n.expand?.project?.name === f).length;
              const isActive = projectFilter === f;
              return (
                <span
                  key={f}
                  onClick={() => setProjectFilter(f)}
                  style={{
                    fontSize: 12, fontWeight: 500, padding: "5px 11px", borderRadius: 999,
                    background: isActive ? "#0f1014" : "#ffffff",
                    color: isActive ? "#faf7f1" : "#5b606f",
                    border: `1px solid ${isActive ? "#0f1014" : "#d7dae3"}`,
                    cursor: "pointer",
                  }}
                >
                  {f} {count}
                </span>
              );
            })}
          </div>

          {filteredNotes.length === 0 && (
            <div style={{ textAlign: "center", color: "#80859a", fontSize: 14, padding: "32px 0" }}>No notes</div>
          )}

          {/* Note list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filteredNotes.map((n) => {
              const isActive = activeNoteId === n.id;
              const accent = accentForProject(n.project, projects);
              const projectName = n.expand?.project?.name || "";
              return (
                <div
                  key={n.id}
                  onClick={() => setActiveNoteId(n.id)}
                  style={{
                    position: "relative", padding: "13px 14px", borderRadius: 12,
                    background: isActive ? "#faf7f1" : "#ffffff",
                    border: "1px solid #eceef3", cursor: "pointer",
                  }}
                >
                  <span style={{ position: "absolute", left: 0, top: 11, bottom: 11, width: 3, borderRadius: "0 3px 3px 0", background: isActive ? accent : "transparent" }} />
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#15171d", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: "#80859a", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{snippet(n.content)}</div>
                  <div style={{ fontSize: 11, color: "#b3b7c6", marginTop: 6 }}>
                    {projectName ? `${projectName} · ` : ""}{formatUpdated(n.updated)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right pane — note editor */}
        <div style={{ overflowY: "auto", padding: "28px 36px" }}>
          {!activeNote ? (
            <div style={{ textAlign: "center", color: "#80859a", fontSize: 15, paddingTop: 80 }}>Select a note or create a new one</div>
          ) : (
            <div style={{ maxWidth: 680, margin: "0 auto" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#80859a" }}>
                  {activeNote.expand?.project?.name || "No project"} · {formatUpdated(activeNote.updated)}
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  {isDirty && (
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 9, border: "1px solid #c9ebed", background: "#e9f6f7", color: "#1d7a82", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.6 : 1 }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12l4 4L19 7" />
                      </svg>
                      {saving ? "Saving…" : "Save"}
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    style={{ width: 32, height: 32, borderRadius: 9, border: "1px solid #d7dae3", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    title="Delete note"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#80859a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              </div>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 600, letterSpacing: "-0.01em", color: "#0f1014", margin: "0 0 16px" }}>
                {activeNote.title}
              </h2>
              <textarea
                value={activeContent}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Start writing…"
                style={{ width: "100%", minHeight: 340, border: "none", outline: "none", resize: "none", background: "transparent", fontFamily: "inherit", fontSize: 15, lineHeight: 1.7, color: "#2c2f3a", whiteSpace: "pre-wrap", boxSizing: "border-box" }}
              />
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
