"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/shell/app-header";
import { AppProvider } from "@/contexts/app-context";
import { CommandPalette } from "@/components/os/command-palette";
import { TaskDrawer } from "@/components/shell/task-drawer";
import { QuickCapture } from "@/components/shell/quick-capture";
import { Toast } from "@/components/shell/toast";

type ScreenMeta = [eyebrow: string, title: string];

const SCREEN_MAP: Record<string, ScreenMeta> = {
  "/dashboard": ["Workspace", "Home"],
  "/today": ["Plan", "Today"],
  "/inbox": ["Capture", "Inbox"],
  "/projects": ["Portfolio", "Projects"],
  "/calendar": ["Schedule", "Calendar"],
  "/goals": ["Direction", "Goals"],
  "/people": ["Network", "People"],
  "/health": ["Wellbeing", "Apple Health"],
  "/habits": ["Routines", "Habits"],
  "/notes": ["Second brain", "Notes"],
  "/review": ["Reflect", "Weekly Review"],
  "/views": ["Lenses", "Saved Views"],
  "/briefing": ["Intelligence", "Daily Briefing"],
  "/settings": ["System", "Settings"],
};

function getScreenMeta(pathname: string): ScreenMeta {
  // Exact match first
  if (SCREEN_MAP[pathname]) return SCREEN_MAP[pathname];

  // Prefix match (e.g. /projects/123 → Projects)
  const matched = Object.keys(SCREEN_MAP).find(
    (key) => key !== "/dashboard" && pathname.startsWith(key + "/")
  );
  if (matched) return SCREEN_MAP[matched];

  return ["", "My Life"];
}

type AppShellProps = {
  children: React.ReactNode;
};

function AppShellInner({ children }: AppShellProps) {
  const pathname = usePathname();
  const [eyebrow, title] = getScreenMeta(pathname);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        fontFamily: "var(--font-inter), sans-serif",
        background: "#faf7f1",
        color: "#15171d",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <AppSidebar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <AppHeader screenEyebrow={eyebrow} screenTitle={title} />

        <main
          className="ml-scroll"
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {children}
        </main>
      </div>

      <CommandPalette />
      <TaskDrawer />
      <QuickCapture />
      <Toast />
    </div>
  );
}

export function AppShell({ children }: AppShellProps) {
  return (
    <AppProvider>
      <AppShellInner>{children}</AppShellInner>
    </AppProvider>
  );
}
