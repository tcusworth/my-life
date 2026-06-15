"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const settingsLinks = [
  { href: "/settings/devices", label: "Devices" },
  { href: "/settings/calendar", label: "Calendar" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b pb-4">
      {settingsLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            pathname === link.href
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
