"use client"

import { useState } from "react"
import { useApp } from "@/contexts/app-context"

export function QuickCapture() {
  const { captureOpen, closeCapture, showToast } = useApp()
  const [text, setText] = useState("")
  const [recOn, setRecOn] = useState(false)

  if (!captureOpen) return null

  function send() {
    if (!text.trim()) return
    showToast("Sent to inbox")
    setText("")
    setRecOn(false)
    closeCapture()
  }

  return (
    <>
      <style>{`@keyframes ml-pop { from { opacity: 0; transform: scale(0.96) translateY(-8px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
      <div
        onClick={closeCapture}
        style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(15,16,20,0.45)", backdropFilter: "blur(3px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "16vh" }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{ width: "540px", maxWidth: "92vw", background: "#ffffff", border: "1px solid #d7dae3", borderRadius: "18px", boxShadow: "0 30px 70px -25px rgba(15,16,20,0.5)", overflow: "hidden", animation: "ml-pop 200ms ease-out both" }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px 20px 14px", borderBottom: "1px solid #eceef3" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "9px", background: "#efe9f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#674197" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.8 4.8L18 9l-4.2 1.2L12 15l-1.8-4.8L6 9z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#15171d" }}>Quick capture</div>
              <div style={{ fontSize: "11.5px", color: "#80859a" }}>Routes to your AI inbox</div>
            </div>
            <button
              onClick={closeCapture}
              style={{ marginLeft: "auto", width: "30px", height: "30px", borderRadius: "8px", border: "1px solid #d7dae3", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#80859a" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "16px 20px 20px" }}>
            <textarea
              autoFocus
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); send() } if (e.key === "Escape") { closeCapture() } }}
              placeholder="What's on your mind? Tasks, ideas, reminders…"
              rows={4}
              style={{ width: "100%", padding: "13px 14px", borderRadius: "12px", border: "1px solid #d7dae3", background: "#faf7f1", fontFamily: "inherit", fontSize: "15px", color: "#15171d", outline: "none", resize: "none", boxSizing: "border-box", lineHeight: 1.55 }}
            />

            <div style={{ display: "flex", alignItems: "center", gap: "9px", marginTop: "12px" }}>
              <button
                onClick={() => setRecOn(r => !r)}
                style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 14px", borderRadius: "10px", border: `1px solid ${recOn ? "#eb6532" : "#d7dae3"}`, background: recOn ? "#fdeee6" : "#fff", color: recOn ? "#b84a1f" : "#5b606f", fontFamily: "inherit", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 160ms" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="2" width="6" height="11" rx="3"/>
                  <path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/>
                </svg>
                {recOn ? "Stop" : "Voice"}
              </button>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: "12px", color: "#b3b7c6" }}>⌘↵ to send</span>
              <button
                onClick={send}
                style={{ padding: "9px 18px", borderRadius: "10px", border: "none", background: "#4a2d6e", color: "#fff", fontFamily: "inherit", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", transition: "background 160ms" }}
              >
                Send to inbox
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
