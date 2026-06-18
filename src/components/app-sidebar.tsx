"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/contexts/app-context";

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  dot?: string;
  isAI?: boolean;
};

const workspaceNav: NavItem[] = [
  {
    title: "Briefing",
    href: "/briefing",
    dot: "#674197",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.8 4.8L18 9l-4.2 1.2L12 15l-1.8-4.8L6 9z"/>
      </svg>
    ),
  },
  {
    title: "Home",
    href: "/dashboard",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5 12 4l9 6.5"/>
        <path d="M5 9.5V20h14V9.5"/>
      </svg>
    ),
  },
  {
    title: "Today",
    href: "/today",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19"/>
      </svg>
    ),
  },
  {
    title: "Inbox",
    href: "/inbox",
    badge: (
      <span style={{ background: "#eb6532", color: "#fff", fontSize: "11px", fontWeight: 600, borderRadius: "999px", minWidth: "19px", height: "19px", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>
        6
      </span>
    ),
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 13h4l1.6 3h4.8L20 13"/>
        <path d="M4 13 6.2 5h11.6L20 13v6H4z"/>
      </svg>
    ),
  },
  {
    title: "Notes",
    href: "/notes",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 4h11l3 3v13H5z"/>
        <path d="M16 4v3h3M9 12h6M9 16h4"/>
      </svg>
    ),
  },
  {
    title: "Projects",
    href: "/projects",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      </svg>
    ),
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2"/>
        <path d="M3 9.5h18M8 3v4M16 3v4"/>
      </svg>
    ),
  },
  {
    title: "Goals",
    href: "/goals",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
  },
  {
    title: "People",
    href: "/people",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="3"/>
        <path d="M3 19a6 6 0 0 1 12 0M16 6a3 3 0 0 1 0 6M21 19a6 6 0 0 0-4-5.6"/>
      </svg>
    ),
  },
  {
    title: "Health",
    href: "/health",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h3l2-5 3 10 2-7 1.5 2H21"/>
      </svg>
    ),
  },
  {
    title: "Habits",
    href: "/habits",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 2l4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3"/>
      </svg>
    ),
  },
];

const intelligenceNav: NavItem[] = [
  {
    title: "Ask AI",
    href: "/dashboard",
    isAI: true,
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#674197" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.8 4.8L18 9l-4.2 1.2L12 15l-1.8-4.8L6 9z"/>
        <path d="M5 16l.7 1.8L7.5 18.5 5.7 19 5 21l-.7-2L2.5 18.5 4.3 17.8z"/>
      </svg>
    ),
  },
  {
    title: "Automations",
    href: "/inbox",
    isAI: true,
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#674197" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="2"/>
        <circle cx="18" cy="18" r="2"/>
        <path d="M6 8v5a4 4 0 0 0 4 4h6"/>
      </svg>
    ),
  },
  {
    title: "Weekly Review",
    href: "/review",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3 7-7M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10"/>
      </svg>
    ),
  },
  {
    title: "Saved Views",
    href: "/views",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 5h18M6 12h12M10 19h4"/>
      </svg>
    ),
  },
];

const systemNav: NavItem[] = [
  {
    title: "Settings",
    href: "/settings",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.1 12.9a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V20a2 2 0 1 1-4 0a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H4a2 2 0 1 1 0-4a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H10a1.6 1.6 0 0 0 1-1.5V4a2 2 0 1 1 4 0a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V10a1.6 1.6 0 0 0 1.5 1H24"/>
      </svg>
    ),
  },
];

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = isNavActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "11px",
        padding: "9px 11px",
        borderRadius: "10px",
        cursor: "pointer",
        fontSize: "13.5px",
        fontWeight: 500,
        textDecoration: "none",
        transition: "background 160ms, color 160ms",
        background: active ? "#e9f6f7" : "transparent",
        color: active ? "#1d7a82" : "#2c2f3a",
      }}
    >
      {active && (
        <span
          style={{
            position: "absolute",
            left: "-16px",
            top: "9px",
            bottom: "9px",
            width: "3px",
            borderRadius: "0 3px 3px 0",
            background: "#29a8b2",
          }}
        />
      )}
      {item.icon}
      <span style={{ flex: 1 }}>{item.title}</span>
      {item.dot && !item.badge && (
        <span
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "999px",
            background: item.dot,
            flexShrink: 0,
          }}
        />
      )}
      {item.badge}
    </Link>
  );
}

export function AppSidebar() {
  const { openPalette } = useApp()
  return (
    <aside
      style={{
        width: "248px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        borderRight: "1px solid #d7dae3",
        padding: "22px 16px 16px",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "11px",
          padding: "4px 8px 0",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "11px",
            background: "#0f1014",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 4 L21 19 L3 19 Z" fill="#f0ae35"/>
            <path d="M12 4 L16.5 19 L3 19 Z" fill="#eb6532"/>
          </svg>
        </div>
        <div style={{ lineHeight: 1 }}>
          <div
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontSize: "19px",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "#0f1014",
            }}
          >
            My Life
          </div>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#80859a",
              marginTop: "3px",
            }}
          >
            Command center
          </div>
        </div>
      </div>

      {/* Search / Command button */}
      <button
        onClick={openPalette}
        style={{
          margin: "20px 0 18px",
          display: "flex",
          alignItems: "center",
          gap: "9px",
          width: "100%",
          padding: "9px 11px",
          borderRadius: "11px",
          border: "1px solid #d7dae3",
          background: "#faf7f1",
          cursor: "pointer",
          color: "#5b606f",
          fontFamily: "inherit",
          fontSize: "13px",
          transition: "border-color 160ms, background 160ms",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#80859a" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="11" cy="11" r="7"/>
          <path d="m20 20-3.5-3.5"/>
        </svg>
        <span style={{ flex: 1, textAlign: "left" }}>Search or jump to…</span>
        <kbd
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "11px",
            background: "#ffffff",
            border: "1px solid #d7dae3",
            borderRadius: "5px",
            padding: "1px 5px",
            color: "#80859a",
          }}
        >
          ⌘K
        </kbd>
      </button>

      {/* Workspace section */}
      <div
        style={{
          fontSize: "10.5px",
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#b3b7c6",
          padding: "0 8px 8px",
        }}
      >
        Workspace
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        {workspaceNav.map((item) => (
          <NavLink key={item.href + item.title} item={item} />
        ))}
      </nav>

      {/* Intelligence section */}
      <div
        style={{
          fontSize: "10.5px",
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#b3b7c6",
          padding: "20px 8px 8px",
        }}
      >
        Intelligence
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        {intelligenceNav.map((item) => (
          <NavLink key={item.href + item.title} item={item} />
        ))}
      </nav>

      {/* System section */}
      <div
        style={{
          fontSize: "10.5px",
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#b3b7c6",
          padding: "20px 8px 8px",
        }}
      >
        System
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        {systemNav.map((item) => (
          <NavLink key={item.href + item.title} item={item} />
        ))}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Account chip */}
      <Link
        href="/settings"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "9px",
          borderRadius: "12px",
          border: "1px solid #eceef3",
          background: "#faf7f1",
          cursor: "pointer",
          transition: "border-color 160ms",
          textDecoration: "none",
        }}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "9px",
            background: "linear-gradient(135deg, #29a8b2, #674197)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          TC
        </div>
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#15171d",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Trevor Cusworth
          </div>
          <div style={{ fontSize: "11px", color: "#80859a" }}>Pro workspace</div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#80859a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="2.5"/>
          <path d="M12 4v.01M12 20v-.01"/>
        </svg>
      </Link>
    </aside>
  );
}
