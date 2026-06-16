"use client"

import { useApp } from "@/contexts/app-context"

export function Toast() {
  const { toast } = useApp()

  if (!toast) return null

  return (
    <>
      <style>{`@keyframes ml-toast { from { opacity: 0; transform: translateY(12px) translateX(-50%); } to { opacity: 1; transform: translateY(0) translateX(-50%); } }`}</style>
      <div
        style={{
          position: "fixed",
          bottom: "28px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 90,
          display: "flex",
          alignItems: "center",
          gap: "9px",
          padding: "11px 18px",
          borderRadius: "999px",
          background: "#15171d",
          color: "#fff",
          fontFamily: "inherit",
          fontSize: "13.5px",
          fontWeight: 500,
          boxShadow: "0 8px 30px -8px rgba(15,16,20,0.5)",
          whiteSpace: "nowrap",
          animation: "ml-toast 220ms cubic-bezier(0.22,0.61,0.36,1) both",
          pointerEvents: "none",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l4 4L19 7"/>
        </svg>
        {toast}
      </div>
    </>
  )
}
