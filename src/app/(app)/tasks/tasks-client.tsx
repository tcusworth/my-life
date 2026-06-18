"use client";

import { useState, useTransition } from "react";
import type { Task, TaskPriority, RecurrenceRule } from "@/types/pocketbase";

type View = "today" | "upcoming" | "inbox" | "active" | "someday";
type NewStatus = "inbox" | "active" | "someday";

const PRIORITY_COLOR: Record<string, string> = {
  urgent: "#eb6532",
  high: "#f0ae35",
  medium: "#29a8b2",
  low: "#b3b7c6",
};

const VIEWS: { key: View; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "inbox", label: "Inbox" },
  { key: "active", label: "Active" },
  { key: "someday", label: "Someday" },
];

function computeNextDueAt(dueAt: string | undefined, rule: RecurrenceRule): string {
  const base = dueAt ? new Date(dueAt) : new Date();
  switch (rule) {
    case "daily": base.setDate(base.getDate() + 1); break;
    case "weekly": base.setDate(base.getDate() + 7); break;
    case "biweekly": base.setDate(base.getDate() + 14); break;
    case "monthly": base.setMonth(base.getMonth() + 1); break;
  }
  return base.toISOString();
}

function parseInput(raw: string): { title: string; dueAt?: string; priority?: TaskPriority } {
  let text = raw.trim();
  let priority: TaskPriority | undefined;
  let dueAt: string | undefined;

  if (text.includes("!!")) {
    priority = "urgent";
    text = text.replace("!!", "").trim();
  } else if (/(?:^|\s)!(?:\s|$)/.test(text)) {
    priority = "high";
    text = text.replace(/(?:^|\s)!(?=\s|$)/, " ").trim();
  }

  const now = new Date();
  if (/\btoday\b/i.test(text)) {
    dueAt = now.toISOString().slice(0, 10);
    text = text.replace(/\btoday\b/i, "").trim();
  } else if (/\btomorrow\b/i.test(text)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    dueAt = d.toISOString().slice(0, 10);
    text = text.replace(/\btomorrow\b/i, "").trim();
  } else {
    const m = text.match(
      /\bnext\s+(mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\b/i
    );
    if (m) {
      const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      const idx = DAYS.indexOf(m[1].slice(0, 3).toLowerCase());
      const d = new Date(now);
      let diff = idx - d.getDay();
      if (diff <= 0) diff += 7;
      d.setDate(d.getDate() + diff);
      dueAt = d.toISOString().slice(0, 10);
      text = text.replace(m[0], "").trim();
    }
  }

  return { title: text || raw.trim(), dueAt, priority };
}

function formatDue(iso: string): { label: string; overdue: boolean } {
  const todayStr = new Date().toISOString().slice(0, 10);
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const d = iso.slice(0, 10);
  if (d === todayStr) return { label: "Today", overdue: false };
  if (d === tomorrowStr) return { label: "Tmrw", overdue: false };
  return {
    label: new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    overdue: d < todayStr,
  };
}

const sel: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: 8,
  border: "1px solid #d7dae3",
  background: "#fff",
  fontFamily: "inherit",
  fontSize: 13,
  color: "#5b606f",
  cursor: "pointer",
};

export function TasksClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [view, setView] = useState<View>("inbox");
  const [newTitle, setNewTitle] = useState("");
  const [newStatus, setNewStatus] = useState<NewStatus>("inbox");
  const [newRecurrence, setNewRecurrence] = useState<RecurrenceRule>("none");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [subtaskParent, setSubtaskParent] = useState<string | null>(null);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const todayStr = new Date().toISOString().slice(0, 10);
  const in7Str = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  function getViewTasks(v: View): Task[] {
    const top = tasks.filter(
      (t) => !t.parentTask && t.status !== "completed" && t.status !== "cancelled"
    );
    switch (v) {
      case "today":
        return top.filter(
          (t) =>
            t.dueAt?.slice(0, 10) === todayStr ||
            t.scheduledFor?.slice(0, 10) === todayStr
        );
      case "upcoming":
        return top.filter(
          (t) =>
            t.dueAt &&
            t.dueAt.slice(0, 10) > todayStr &&
            t.dueAt.slice(0, 10) <= in7Str
        );
      case "inbox":
        return top.filter((t) => t.status === "inbox");
      case "active":
        return top.filter((t) => t.status === "active");
      case "someday":
        return top.filter((t) => t.status === "someday");
    }
  }

  function getSubtasks(parentId: string): Task[] {
    return tasks.filter(
      (t) =>
        t.parentTask === parentId &&
        t.status !== "completed" &&
        t.status !== "cancelled"
    );
  }

  function getProgress(parentId: string): { done: number; total: number } {
    const all = tasks.filter((t) => t.parentTask === parentId);
    const done = all.filter(
      (t) => t.status === "completed" || t.status === "cancelled"
    ).length;
    return { done, total: all.length };
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreateError(null);
    const { title, dueAt, priority } = parseInput(newTitle);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          status: newStatus,
          priority,
          dueAt,
          recurrenceRule: newRecurrence !== "none" ? newRecurrence : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setCreateError(err?.error ?? `Error ${res.status}`);
        return;
      }
      const created = await res.json();
      setTasks((prev) => [created, ...prev]);
      setNewTitle("");
      setNewRecurrence("none");
    } catch (err) {
      setCreateError(String(err));
    }
  }

  async function createSubtask(parentId: string) {
    if (!subtaskTitle.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: subtaskTitle.trim(),
        status: "inbox",
        parentTask: parentId,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setTasks((prev) => [...prev, created]);
      setSubtaskTitle("");
      setSubtaskParent(null);
    }
  }

  async function completeTask(id: string) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed", completedAt: new Date().toISOString() }),
    });
    if (res.ok) {
      const data = await res.json();
      startTransition(() => {
        setTasks((prev) => {
          const without = prev.filter((t) => t.id !== id);
          return data.nextTask ? [...without, data.nextTask] : without;
        });
      });
    }
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function renderTask(task: Task, isSubtask = false): React.ReactNode {
    const subtasks = isSubtask ? [] : getSubtasks(task.id);
    const progress = isSubtask ? { done: 0, total: 0 } : getProgress(task.id);
    const isExpanded = expanded.has(task.id);
    const due = task.dueAt ? formatDue(task.dueAt) : null;
    const isRecurring = task.recurrenceRule && task.recurrenceRule !== "none";

    return (
      <div key={task.id}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: isSubtask ? "8px 12px" : "11px 14px",
            background: "#fff",
            border: "1px solid #eceef3",
            borderRadius: 11,
            marginBottom: 3,
          }}
        >
          {/* Expand toggle */}
          <button
            onClick={() => !isSubtask && toggleExpand(task.id)}
            style={{
              width: 16,
              height: 16,
              border: "none",
              background: "transparent",
              cursor: isSubtask ? "default" : "pointer",
              color: isSubtask ? "transparent" : "#b3b7c6",
              padding: 0,
              fontSize: 9,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!isSubtask ? (isExpanded ? "▾" : "▸") : ""}
          </button>

          {/* Complete button */}
          <button
            onClick={() => completeTask(task.id)}
            title="Mark complete"
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              border: `1.5px solid ${task.priority ? PRIORITY_COLOR[task.priority] : "#d7dae3"}`,
              background: "transparent",
              cursor: "pointer",
              flexShrink: 0,
              padding: 0,
            }}
          />

          {/* Title */}
          <span
            style={{
              flex: 1,
              fontSize: isSubtask ? 13.5 : 14,
              color: "#15171d",
              lineHeight: 1.4,
            }}
          >
            {task.title}
          </span>

          {/* Recurrence indicator */}
          {isRecurring && (
            <span
              title={`Repeats ${task.recurrenceRule}`}
              style={{ fontSize: 12, color: "#b3b7c6" }}
            >
              ↻
            </span>
          )}

          {/* Subtask progress badge */}
          {!isSubtask && progress.total > 0 && (
            <span
              style={{
                fontSize: 11,
                color: "#80859a",
                background: "#f5f6f9",
                borderRadius: 999,
                padding: "1px 7px",
                whiteSpace: "nowrap",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {progress.done}/{progress.total}
            </span>
          )}

          {/* Priority dot */}
          {task.priority && (
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: PRIORITY_COLOR[task.priority],
                flexShrink: 0,
              }}
              title={task.priority}
            />
          )}

          {/* Due date */}
          {due && (
            <span
              style={{
                fontSize: 11.5,
                color: due.overdue ? "#eb6532" : "#80859a",
                fontFamily: "var(--font-jetbrains-mono), monospace",
                whiteSpace: "nowrap",
              }}
            >
              {due.label}
            </span>
          )}
        </div>

        {/* Expanded subtasks */}
        {!isSubtask && isExpanded && (
          <div style={{ paddingLeft: 26, marginBottom: 6 }}>
            {subtasks.map((sub) => renderTask(sub, true))}

            {subtaskParent === task.id ? (
              <div style={{ display: "flex", gap: 6, paddingTop: 2 }}>
                <input
                  autoFocus
                  value={subtaskTitle}
                  onChange={(e) => setSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createSubtask(task.id);
                    if (e.key === "Escape") {
                      setSubtaskParent(null);
                      setSubtaskTitle("");
                    }
                  }}
                  placeholder="Subtask title…"
                  style={{
                    flex: 1,
                    padding: "7px 10px",
                    borderRadius: 8,
                    border: "1px solid #d7dae3",
                    fontFamily: "inherit",
                    fontSize: 13.5,
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => createSubtask(task.id)}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 8,
                    border: "none",
                    background: "#0f1014",
                    color: "#faf7f1",
                    fontFamily: "inherit",
                    fontSize: 12.5,
                    cursor: "pointer",
                  }}
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setSubtaskParent(null);
                    setSubtaskTitle("");
                  }}
                  style={{
                    padding: "7px 10px",
                    borderRadius: 8,
                    border: "1px solid #eceef3",
                    background: "transparent",
                    fontFamily: "inherit",
                    fontSize: 12.5,
                    color: "#80859a",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setSubtaskParent(task.id);
                  setExpanded((prev) => new Set([...prev, task.id]));
                }}
                style={{
                  marginTop: 2,
                  padding: "5px 10px",
                  borderRadius: 8,
                  border: "1px dashed #d7dae3",
                  background: "transparent",
                  fontFamily: "inherit",
                  fontSize: 12.5,
                  color: "#80859a",
                  cursor: "pointer",
                }}
              >
                + Add subtask
              </button>
            )}
          </div>
        )}

      </div>
    );
  }

  const viewTasks = getViewTasks(view);

  return (
    <div style={{ padding: "28px 32px", maxWidth: 720, margin: "0 auto" }}>
      {/* Quick-add form */}
      <form onSubmit={createTask} style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder='Quick add… "dentist tomorrow !!"'
            style={{
              flex: 1,
              padding: "11px 14px",
              borderRadius: 10,
              border: "1px solid #d7dae3",
              background: "#fff",
              fontFamily: "inherit",
              fontSize: 14.5,
              color: "#15171d",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "11px 22px",
              borderRadius: 10,
              border: "none",
              background: "#0f1014",
              color: "#faf7f1",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as NewStatus)}
            style={sel}
          >
            <option value="inbox">Inbox</option>
            <option value="active">Active</option>
            <option value="someday">Someday</option>
          </select>
          <select
            value={newRecurrence}
            onChange={(e) => setNewRecurrence(e.target.value as RecurrenceRule)}
            style={sel}
          >
            <option value="none">No repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
          </select>
          {createError && (
            <span style={{ fontSize: 12, color: "#eb6532" }}>{createError}</span>
          )}
          {newRecurrence !== "none" && (
            <span style={{ fontSize: 12, color: "#29a8b2" }}>
              ↻ Repeats {newRecurrence}
            </span>
          )}
        </div>
      </form>

      {/* View tabs */}
      <div
        style={{
          display: "flex",
          gap: 2,
          marginBottom: 22,
          borderBottom: "1px solid #eceef3",
        }}
      >
        {VIEWS.map(({ key, label }) => {
          const count = getViewTasks(key).length;
          const active = view === key;
          return (
            <button
              key={key}
              onClick={() => setView(key)}
              style={{
                padding: "8px 14px",
                border: "none",
                borderBottom: `2px solid ${active ? "#0f1014" : "transparent"}`,
                background: "transparent",
                fontFamily: "inherit",
                fontSize: 13.5,
                fontWeight: active ? 600 : 400,
                color: active ? "#0f1014" : "#80859a",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginBottom: -1,
              }}
            >
              {label}
              {count > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    background: active ? "#0f1014" : "#f0f1f5",
                    color: active ? "#fff" : "#80859a",
                    borderRadius: 999,
                    padding: "1px 6px",
                    fontWeight: 500,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Task list */}
      {viewTasks.length === 0 ? (
        <p
          style={{
            fontSize: 13.5,
            color: "#b3b7c6",
            fontStyle: "italic",
            textAlign: "center",
            marginTop: 48,
          }}
        >
          {view === "today"
            ? "Nothing due today"
            : view === "upcoming"
            ? "Nothing coming up this week"
            : "No tasks here"}
        </p>
      ) : (
        <div>{viewTasks.map((task) => renderTask(task))}</div>
      )}
    </div>
  );
}
