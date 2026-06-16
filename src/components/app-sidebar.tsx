"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  CalendarDays,
  FolderKanban,
  Home,
  Inbox,
  Monitor,
  Settings,
  Sparkles,
  Sun,
  WandSparkles,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const primaryNav: NavItem[] = [
  { title: "Home", href: "/dashboard", icon: Home },
  { title: "Today", href: "/today", icon: Sun },
  { title: "Inbox", href: "/inbox", icon: Inbox },
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "Calendar", href: "/calendar", icon: CalendarDays },
];

const aiNav: NavItem[] = [
  { title: "Command", href: "/dashboard", icon: WandSparkles },
  { title: "Automations", href: "/dashboard", icon: Workflow },
  { title: "AI", href: "/dashboard", icon: Bot },
];

const systemNav: NavItem[] = [
  { title: "Devices", href: "/settings/devices", icon: Monitor },
  { title: "Settings", href: "/settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function RailButton({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = isActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      title={item.title}
      className={cn(
        "group relative flex size-11 items-center justify-center rounded-2xl transition",
        active
          ? "bg-white text-slate-950 shadow-lg shadow-black/30"
          : "text-slate-500 hover:bg-white/10 hover:text-white"
      )}
    >
      <item.icon className="size-5" />

      <span className="pointer-events-none absolute left-14 z-50 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-xl transition group-hover:translate-x-1 group-hover:opacity-100">
        {item.title}
      </span>
    </Link>
  );
}

function RailGroup({ items }: { items: NavItem[] }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {items.map((item) => (
        <RailButton key={`${item.title}-${item.href}`} item={item} />
      ))}
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="relative flex w-[88px] shrink-0 flex-col items-center justify-between overflow-visible bg-[#050816] px-3 py-4 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25),transparent_35%)]" />

      <div className="relative flex flex-col items-center gap-8">
        <Link
          href="/dashboard"
          title="My Life"
          className="flex size-12 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/30 transition hover:scale-105"
        >
          <Sparkles className="size-5" />
        </Link>

        <RailGroup items={primaryNav} />

        <div className="h-px w-8 bg-white/10" />

        <RailGroup items={aiNav} />
      </div>

      <div className="relative flex flex-col items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[11px] font-semibold text-slate-400">
          ⌘K
        </div>

        <div className="h-px w-8 bg-white/10" />

        <RailGroup items={systemNav} />
      </div>
    </aside>
  );
}