"use client";

import { useState, useTransition } from "react";
import type { Task } from "@/types/pocketbase";

interface TasksClientProps {
  initialTasks: Task[];
}

const STATUS_GROUPS = [
  { key: "inbox", label: "Inbox" },
  { key: "active", label: "Active" },
  { key: "someday", label: "Someday" },
] as const;

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "#eb6532",
  high: "#f0ae35",
  medium: "#29a8b2",
  low: "#b3b7c6",
};

export function TasksClient({ initialTasks }: TasksClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTitle, setNewTitle] = useState("");
  const [newStatus, setNewStatus] = useState<"inbox" | "active">("inbox");
  const [, startTransition] = useTransition();

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), status: newStatus }),
    });
    if (res.ok) {
      const created = await res.json();
      setTasks((prev) => [created, ...prev]);
      setNewTitle("");
    }
  }

  async function completeTask(id: string) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed", completedAt: new Date().toISOString() }),
    });
    if (res.ok) {
      startTransition(() => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      });
    }
  }

  const grouped = STATUS_GROUPS.map(({ key, label }) => ({
    key,
    label,
    tasks: tasks.filter((t) => t.status === key),
  }));

  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div style={{ padding: "28px 32px", maxWidth: 760, margin: "0 auto" }}>
      {/* Create form */}
      <form onSubmit={createTask} style={{ display: "flex", gap: 10, marginBottom: 32 }}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a task…"
          style={{ flex: 1, padding: "11px 14px", borderRadius: 10, border: "1px solid #d7dae3", background: "#fff", fontFamily: "inherit", fontSize: 14.5, color: "#15171d", outline: "none" }}
        />
        <select
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value as "inbox" | "active")}
          style={{ padding: "11px 12px", borderRadius: 10, border: "1px solid #d7dae3", background: "#fff", fontFamily: "inherit", fontSize: 13.5, color: "#5b606f", cursor: "pointer" }}
        >
          <option value="inbox">Inbox</option>
          <option value="active">Active</option>
        </select>
        <button
          type="submit"
          style={{ padding: "11px 20px", borderRadius: 10, border: "none", background: "#0f1014", color: "#faf7f1", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          Add
        </button>
      </form>

      {/* Groups */}
      {grouped.map(({ key, label, tasks: groupTasks }) => (
        <div key={key} style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#80859a" }}>{label}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#b3b7c6", background: "#f5f6f9", borderRadius: 999, padding: "1px 7px" }}>{groupTasks.length}</span>
          </div>

          {groupTasks.length === 0 ? (
            <p style={{ fontSize: 13.5, color: "#b3b7c6", fontStyle: "italic", margin: 0, paddingLeft: 4 }}>No tasks</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {groupTasks.map((task) => (
                <div
                  key={task.id}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#fff", border: "1px solid #eceef3", borderRadius: 12 }}
                >
                  <button
                    onClick={() => completeTask(task.id)}
                    title="Mark complete"
                    style={{ width: 20, height: 20, borderRadius: 999, border: "1.5px solid #d7dae3", background: "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 160ms" }}
                  />
                  <span style={{ flex: 1, fontSize: 14, color: "#15171d" }}>{task.title}</span>
                  {task.priority && (
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: PRIORITY_COLORS[task.priority] ?? "#b3b7c6", flexShrink: 0 }} title={task.priority} />
                  )}
                  {task.dueAt && (
                    <span style={{ fontSize: 11.5, color: "#80859a", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                      {new Date(task.dueAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {completedCount > 0 && (
        <p style={{ fontSize: 13, color: "#b3b7c6", textAlign: "center" }}>{completedCount} completed task{completedCount !== 1 ? "s" : ""} hidden</p>
      )}
    </div>
  );
}
