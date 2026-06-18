"use client";

import { useApp } from "@/contexts/app-context";
import { useAuth } from "@/components/providers/auth-provider";

type AppHeaderProps = {
  screenEyebrow: string;
  screenTitle: string;
};

export function AppHeader({ screenEyebrow, screenTitle }: AppHeaderProps) {
  const { openPalette, openDrawer } = useApp();
  const { logout } = useAuth();
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "0 28px",
        height: "64px",
        flexShrink: 0,
        borderBottom: "1px solid #d7dae3",
        background: "rgba(250, 247, 241, 0.85)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {/* Left: eyebrow + title */}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: "10.5px",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#80859a",
          }}
        >
          {screenEyebrow}
        </div>
        <div
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontSize: "18px",
            fontWeight: 600,
            color: "#0f1014",
            letterSpacing: "-0.01em",
            marginTop: "1px",
          }}
        >
          {screenTitle}
        </div>
      </div>

      {/* Middle spacer */}
      <div style={{ flex: 1 }} />

      {/* Right: search, bell, new */}
      <button
        onClick={openPalette}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "9px",
          padding: "8px 12px",
          borderRadius: "10px",
          border: "1px solid #d7dae3",
          background: "#ffffff",
          cursor: "pointer",
          color: "#80859a",
          fontFamily: "inherit",
          fontSize: "13px",
          minWidth: "230px",
          transition: "border-color 160ms",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#80859a" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="11" cy="11" r="7"/>
          <path d="m20 20-3.5-3.5"/>
        </svg>
        <span style={{ flex: 1, textAlign: "left" }}>Search…</span>
        <kbd
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "11px",
            color: "#b3b7c6",
          }}
        >
          ⌘K
        </kbd>
      </button>

      <button
        style={{
          position: "relative",
          width: "38px",
          height: "38px",
          borderRadius: "10px",
          border: "1px solid #d7dae3",
          background: "#ffffff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 160ms",
          flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2c2f3a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/>
          <path d="M10 20a2 2 0 0 0 4 0"/>
        </svg>
        <span
          style={{
            position: "absolute",
            top: "8px",
            right: "9px",
            width: "7px",
            height: "7px",
            borderRadius: "999px",
            background: "#eb6532",
            border: "1.5px solid #fff",
          }}
        />
      </button>

      <button
        onClick={() => openDrawer()}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          padding: "9px 15px",
          borderRadius: "10px",
          border: "none",
          background: "#0f1014",
          color: "#faf7f1",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: "13px",
          fontWeight: 500,
          transition: "background 160ms, transform 160ms",
          flexShrink: 0,
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        New
      </button>

      <button
        onClick={logout}
        title="Sign out"
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "10px",
          border: "1px solid #d7dae3",
          background: "#ffffff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#80859a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </header>
  );
}
