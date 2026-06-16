"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  CalendarDays,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Monitor,
  Settings,
  Sun,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const mainNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Inbox", href: "/inbox", icon: Inbox },
  { title: "Today", href: "/today", icon: Sun },
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "Calendar", href: "/calendar", icon: CalendarDays },
];

const settingsNav = [
  { title: "Devices", href: "/settings/devices", icon: Monitor },
  { title: "Calendar", href: "/settings/calendar", icon: Calendar },
];

function NavItems({
  items,
}: {
  items: { title: string; href: string; icon: React.ComponentType<{ className?: string }> }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              render={<Link href={item.href} />}
              isActive={isActive}
              className={cn(
                "type-body",
                isActive && "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="size-4 opacity-70" />
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex size-7 items-center justify-center rounded-md bg-foreground text-background">
                <span className="type-micro text-background normal-case tracking-normal">ML</span>
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="type-h3 truncate">My Life</span>
                <span className="type-small truncate text-muted-foreground">
                  Productivity
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-1 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="type-micro px-2 normal-case tracking-normal">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavItems items={mainNav} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="type-micro px-2 normal-case tracking-normal">
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavItems items={settingsNav} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-1 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/settings/devices" />}>
              <Settings className="size-4 opacity-70" />
              <span className="type-body">Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
