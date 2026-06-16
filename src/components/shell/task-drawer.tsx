"use client"

import { useApp } from "@/contexts/app-context"

const projects = ["Series A raise", "Q3 product launch", "Marathon training", "Home renovation", "Italy trip"]

export function TaskDrawer() {
  const { drawerOpen, draft, closeDrawer, updateDraft, saveDraft } = useApp()

  if (!drawerOpen || !draft) return null

  const prioOpts = [
    { key: "high", label: "High" },
    { key: "med", label: "Med" },
    { key: "low", label: "Low" },
  ]
  const whenOpts = [
    { key: "today", label: "Today" },
    { key: "tomorrow", label: "Tomorrow" },
    { key: "week", label: "This week" },
  ]

  const segStyle = (active: boolean) => ({
    flex: 1,
    padding: "9px",
    borderRadius: "10px",
    border: `1px solid ${active ? "#15171d" : "#d7dae3"}`,
    background: active ? "#15171d" : "#ffffff",
    color: active ? "#ffffff" : "#5b606f",
    fontFamily: "inherit",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 140ms",
  } as React.CSSProperties)

  const projStyle = (active: boolean) => ({
    padding: "7px 12px",
    borderRadius: "9px",
    border: `1px solid ${active ? "#29a8b2" : "#d7dae3"}`,
    background: active ? "#e9f6f7" : "#ffffff",
    color: active ? "#1d7a82" : "#5b606f",
    fontFamily: "inherit",
    fontSize: "12.5px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 140ms",
  } as React.CSSProperties)

  return (
    <>
      <style>{`@keyframes ml-slide { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(15,16,20,0.35)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "flex-end" }}
      >
        {/* Drawer */}
        <div
          onClick={e => e.stopPropagation()}
          style={{ width: "440px", maxWidth: "92vw", height: "100%", background: "#faf7f1", borderLeft: "1px solid #d7dae3", boxShadow: "-30px 0 60px -30px rgba(15,16,20,0.4)", display: "flex", flexDirection: "column", animation: "ml-slide 240ms cubic-bezier(0.22,0.61,0.36,1) both" }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #eceef3" }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "20px", fontWeight: 600, color: "#0f1014", margin: 0 }}>
              {draft.id ? "Edit task" : "New task"}
            </h2>
            <button onClick={closeDrawer} style={{ width: "34px", height: "34px", borderRadius: "9px", border: "1px solid #d7dae3", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#80859a" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#80859a", marginBottom: "8px" }}>Task</label>
              <input
                autoFocus
                value={draft.title}
                onChange={e => updateDraft("title", e.target.value)}
                placeholder="What needs doing?"
                style={{ width: "100%", padding: "12px 14px", borderRadius: "11px", border: "1px solid #d7dae3", background: "#fff", fontFamily: "inherit", fontSize: "15px", color: "#15171d", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#80859a", marginBottom: "8px" }}>Priority</label>
              <div style={{ display: "flex", gap: "7px" }}>
                {prioOpts.map(o => (
                  <button key={o.key} onClick={() => updateDraft("p", o.key)} style={segStyle(draft.p === o.key)}>{o.label}</button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#80859a", marginBottom: "8px" }}>When</label>
              <div style={{ display: "flex", gap: "7px" }}>
                {whenOpts.map(o => (
                  <button key={o.key} onClick={() => updateDraft("when", o.key)} style={segStyle(draft.when === o.key)}>{o.label}</button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#80859a", marginBottom: "8px" }}>Time</label>
              <input
                value={draft.time}
                onChange={e => updateDraft("time", e.target.value)}
                placeholder="e.g. 9:00"
                style={{ width: "100%", padding: "12px 14px", borderRadius: "11px", border: "1px solid #d7dae3", background: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: "14px", color: "#15171d", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#80859a", marginBottom: "8px" }}>Project</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                {projects.map(p => (
                  <button key={p} onClick={() => updateDraft("project", p)} style={projStyle(draft.project === p)}>{p}</button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#80859a", marginBottom: "8px" }}>Notes</label>
              <textarea
                value={draft.notes}
                onChange={e => updateDraft("notes", e.target.value)}
                placeholder="Add detail…"
                rows={3}
                style={{ width: "100%", padding: "12px 14px", borderRadius: "11px", border: "1px solid #d7dae3", background: "#fff", fontFamily: "inherit", fontSize: "14px", color: "#15171d", outline: "none", resize: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", gap: "10px", padding: "18px 24px", borderTop: "1px solid #eceef3", background: "#fff" }}>
            <button onClick={closeDrawer} style={{ padding: "11px 18px", borderRadius: "11px", border: "1px solid #d7dae3", background: "#fff", color: "#2c2f3a", fontFamily: "inherit", fontSize: "13.5px", fontWeight: 500, cursor: "pointer" }}>Cancel</button>
            <button
              onClick={saveDraft}
              style={{ flex: 1, padding: "11px", borderRadius: "11px", border: "none", background: "#0f1014", color: "#faf7f1", fontFamily: "inherit", fontSize: "13.5px", fontWeight: 600, cursor: "pointer" }}
            >
              {draft.id ? "Save changes" : "Create task"}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
