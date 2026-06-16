"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  Inbox,
  Loader2,
  Search,
  Sparkles,
  X,
} from "lucide-react";

type CommandItem = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => Promise<void> | void;
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function createTask() {
    const title = query.trim() || "Untitled task";

    const response = await fetch("/api/os-command", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "TASK_CREATE",
        payload: {
          title,
          status: "inbox",
        },
        meta: {
          source: "command-palette",
        },
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.error ?? "Failed to create task");
    }

    setSuccessMessage(`Created task: ${title}`);
  }

  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: "create-task",
        title: query.trim() ? `Create task "${query.trim()}"` : "Create task",
        description: "Capture a new task into your inbox",
        icon: CheckCircle2,
        action: createTask,
      },
      {
        id: "open-inbox",
        title: "Open inbox",
        description: "Review captured items and loose notes",
        icon: Inbox,
        action: () => {
          window.location.href = "/inbox";
        },
      },
      {
        id: "open-today",
        title: "Open today",
        description: "See what needs attention now",
        icon: Sparkles,
        action: () => {
          window.location.href = "/today";
        },
      },
      {
        id: "open-projects",
        title: "Open projects",
        description: "Review active outcomes and open loops",
        icon: FolderKanban,
        action: () => {
          window.location.href = "/projects";
        },
      },
      {
        id: "open-calendar",
        title: "Open calendar",
        description: "See your schedule and commitments",
        icon: CalendarDays,
        action: () => {
          window.location.href = "/calendar";
        },
      },
      {
        id: "ask-ai",
        title: query.trim() ? `Ask AI about "${query.trim()}"` : "Ask AI",
        description: "Use the AI layer to reason across your life system",
        icon: Bot,
        action: () => {
          setSuccessMessage("AI command center coming next.");
        },
      },
    ],
    [query]
  );

  const filteredCommands = commands.filter((command) => {
    const searchText = `${command.title} ${command.description}`.toLowerCase();
    return searchText.includes(query.toLowerCase()) || command.id === "create-task";
  });

  async function runCommand(command: CommandItem) {
    try {
      setIsRunning(true);
      await command.action();

      if (command.id !== "ask-ai") {
        setTimeout(() => {
          setOpen(false);
          setQuery("");
          setSuccessMessage(null);
        }, 450);
      }
    } catch (error) {
      console.error(error);
      setSuccessMessage("Command failed. Check the console.");
    } finally {
      setIsRunning(false);
    }
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }

      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
        setSuccessMessage(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      document.getElementById("command-palette-input")?.focus();
    }, 50);

    return () => window.clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/70 px-4 pt-24 backdrop-blur-xl">
      <style>
        {`
          @keyframes command-rise {
            from { opacity: 0; transform: translateY(18px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

          @keyframes command-glow {
            0%, 100% { opacity: 0.45; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.08); }
          }

          .command-rise {
            animation: command-rise 180ms ease-out both;
          }

          .command-glow {
            animation: command-glow 4s ease-in-out infinite;
          }
        `}
      </style>

      <div className="command-rise relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 text-white shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.35),transparent_32%),radial-gradient(circle_at_90%_10%,rgba(6,182,212,0.22),transparent_28%)]" />
        <div className="command-glow pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/30 blur-3xl" />

        <div className="relative border-b border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl">
            <Search className="size-5 text-slate-400" />
            <input
              id="command-palette-input"
              className="h-9 flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-500"
              placeholder="Create a task, open a page, or ask AI..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSuccessMessage(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && filteredCommands[0]) {
                  event.preventDefault();
                  runCommand(filteredCommands[0]);
                }
              }}
            />

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setQuery("");
                setSuccessMessage(null);
              }}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="relative max-h-[460px] overflow-y-auto p-3">
          {successMessage && (
            <div className="mb-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              {successMessage}
            </div>
          )}

          <div className="space-y-2">
            {filteredCommands.map((command, index) => (
              <button
                key={command.id}
                type="button"
                disabled={isRunning}
                onClick={() => runCommand(command)}
                className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white/10 disabled:opacity-60"
              >
                <div className="flex size-10 items-center justify-center rounded-2xl bg-white/10 text-indigo-300 transition group-hover:bg-indigo-500 group-hover:text-white">
                  {isRunning && index === 0 ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <command.icon className="size-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {command.title}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {command.description}
                  </p>
                </div>

                <div className="hidden rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold text-slate-500 group-hover:block">
                  Enter
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-between border-t border-white/10 px-4 py-3 text-xs text-slate-500">
          <span>Type anything to create a task.</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}