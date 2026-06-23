"use client";

import React, { useState } from "react";
import SyncOnMount from "@/components/SyncOnMount";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueAt?: string;
  scheduledFor?: string;
  expand?: { project?: { name: string; color: string } };
}

interface Contact {
  id: string;
  name: string;
  followUpAt?: string;
  notes?: string;
}

interface Props {
  userName: string;
  allTasks: Task[];
  followUpContacts: Contact[];
}

function isToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr.slice(0, 10) + "T12:00:00");
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function daysSince(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr.slice(0, 10) + "T12:00:00");
  const now = new Date();
  const diff = Math.round((now.getTime() - d.getTime()) / 86400000);
  if (diff <= 0) return "today";
  if (diff === 1) return "1d";
  return `${diff}d`;
}

function greeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function priorityBadge(priority: string) {
  if (priority === "urgent" || priority === "high") return { label: "High", bg: "#fdeee6", color: "#b84a1f" };
  if (priority === "medium") return { label: "Med", bg: "#fdf4e0", color: "#b17d1f" };
  return { label: "Low", bg: "#e9f6f7", color: "#1d7a82" };
}

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

const AVATAR_COLORS = ["#fdeee6/#b84a1f", "#e9f6f7/#1d7a82", "#fdf4e0/#b17d1f", "#efe9f5/#4a2d6e"];

function StatIcon({ label }: { label: string }) {
  const paths: Record<string, string> = {
    Inbox: "M4 13h4l1.6 3h4.8L20 13M4 13 6.2 5h11.6L20 13v6H4z",
    Today: "M12 8v4l3 2M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z",
    "Follow-ups": "M9 8a3 3 0 1 0 0-.01M3 19a6 6 0 0 1 12 0M16 6a3 3 0 0 1 0 6",
    Focus: "M12 3l1.8 4.8L18 9l-4.2 1.2L12 15l-1.8-4.8L6 9z",
  };
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[label]} />
    </svg>
  );
}

export default function DashboardClient({ userName, allTasks, followUpContacts }: Props) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const now = new Date();
  const hour = now.getHours();
  const firstName = userName.split(" ")[0] || "there";
  const dateEyebrow = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase();

  const inboxTasks = allTasks.filter((t) => t.status === "inbox");
  const todayTasks = allTasks.filter((t) => isToday(t.dueAt) || isToday(t.scheduledFor));

  const stats = [
    { label: "Inbox", value: inboxTasks.length, helper: "Items to triage", color: "#eb6532", soft: "#fdeee6" },
    { label: "Today", value: todayTasks.length, helper: "Tasks scheduled", color: "#29a8b2", soft: "#e9f6f7" },
    { label: "Follow-ups", value: followUpContacts.length, helper: "People waiting", color: "#674197", soft: "#efe9f5" },
    { label: "Focus", value: "—", helper: "Deep work today", color: "#f0ae35", soft: "#fdf4e0" },
  ];

  async function toggleTask(task: Task) {
    if (completedIds.has(task.id)) return;
    setCompletedIds((prev) => new Set([...prev, task.id]));
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
  }

  return (
    <>
      <SyncOnMount />
      <style>{`
        @keyframes ml-rise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ml-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div style={{ padding: "32px", maxWidth: "1320px", margin: "0 auto" }}>
        {/* Hero */}
        <div style={{ animation: "ml-rise 480ms ease-out both", marginBottom: "26px" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#80859a" }}>
            {dateEyebrow}
          </span>
          <h1 style={{ fontFamily: "var(--font-serif, 'Fraunces', serif)", fontSize: "42px", fontWeight: 500, lineHeight: 1.06, letterSpacing: "-0.02em", color: "#0f1014", margin: "10px 0 0", maxWidth: "20ch" }}>
            {greeting(hour)}, {firstName}.
          </h1>
          <p style={{ fontSize: "16px", lineHeight: 1.6, color: "#5b606f", margin: "13px 0 0", maxWidth: "62ch" }}>
            You have {todayTasks.length} task{todayTasks.length !== 1 ? "s" : ""} scheduled for today
            {followUpContacts.length > 0 ? ` and ${followUpContacts.length} follow-up${followUpContacts.length !== 1 ? "s" : ""} waiting` : ""}.
          </p>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "26px", animation: "ml-rise 540ms ease-out both" }}>
          {stats.map((s) => (
            <div
              key={s.label}
              style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: "16px", padding: "18px 20px", boxShadow: "0 1px 2px rgba(15,16,20,0.05)", position: "relative", overflow: "hidden" }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: s.color }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12.5px", fontWeight: 500, color: "#5b606f" }}>{s.label}</span>
                <div style={{ width: "30px", height: "30px", borderRadius: "9px", background: s.soft, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                  <StatIcon label={s.label} />
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-serif, 'Fraunces', serif)", fontSize: "40px", fontWeight: 500, letterSpacing: "-0.02em", color: "#0f1014", marginTop: "6px", lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: "12.5px", color: "#80859a", marginTop: "6px" }}>{s.helper}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: "22px", alignItems: "start" }}>
          {/* Left: task list */}
          <div style={{ animation: "ml-rise 600ms ease-out both" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "14px" }}>
              <h2 style={{ fontFamily: "var(--font-serif, 'Fraunces', serif)", fontSize: "22px", fontWeight: 600, color: "#0f1014", margin: 0, letterSpacing: "-0.01em" }}>
                Up next today
              </h2>
              <a href="/today" style={{ fontSize: "13px", fontWeight: 500, color: "#1d7a82", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", textDecoration: "none" }}>
                View agenda
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </div>

            <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 2px rgba(15,16,20,0.05)" }}>
              {todayTasks.length === 0 && (
                <div style={{ padding: "32px 18px", textAlign: "center", color: "#80859a", fontSize: "14px" }}>
                  No tasks scheduled for today
                </div>
              )}
              {todayTasks.map((task, i) => {
                const isDone = completedIds.has(task.id);
                const badge = priorityBadge(task.priority);
                const dot = task.expand?.project?.color || "#d7dae3";
                const projectName = task.expand?.project?.name || "";
                const timeStr = task.dueAt ? new Date(task.dueAt.slice(0, 10) + "T" + (task.dueAt.slice(11, 16) || "12:00")).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: false }) : "";

                return (
                  <div
                    key={task.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "13px",
                      padding: "14px 18px",
                      borderBottom: i < todayTasks.length - 1 ? "1px solid #f5f6f9" : "none",
                    }}
                  >
                    <button
                      onClick={() => toggleTask(task)}
                      style={{
                        width: "21px",
                        height: "21px",
                        borderRadius: "7px",
                        border: `1.8px solid ${isDone ? "#29a8b2" : "#d7dae3"}`,
                        background: isDone ? "#29a8b2" : "transparent",
                        cursor: "pointer",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        transition: "all 160ms",
                      }}
                    >
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: isDone ? 1 : 0 }}>
                        <path d="M5 12l4 4L19 7" />
                      </svg>
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: isDone ? "#b3b7c6" : "#15171d", textDecoration: isDone ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {task.title}
                      </div>
                      {projectName && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
                          <span style={{ width: "7px", height: "7px", borderRadius: "999px", background: dot, flexShrink: 0 }} />
                          <span style={{ fontSize: "12px", color: "#80859a" }}>{projectName}</span>
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "999px", background: badge.bg, color: badge.color, flexShrink: 0 }}>
                      {badge.label}
                    </span>
                    {timeStr && (
                      <span style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontSize: "12px", color: "#5b606f", minWidth: "48px", textAlign: "right", flexShrink: 0 }}>
                        {timeStr}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: follow-ups */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "ml-rise 660ms ease-out both" }}>
            <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 2px rgba(15,16,20,0.05)" }}>
              <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid #f5f6f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 style={{ fontFamily: "var(--font-serif, 'Fraunces', serif)", fontSize: "17px", fontWeight: 600, color: "#0f1014", margin: 0, letterSpacing: "-0.01em" }}>
                  Follow-ups
                </h2>
                <a href="/people" style={{ fontSize: "12px", fontWeight: 500, color: "#1d7a82", textDecoration: "none" }}>
                  View all
                </a>
              </div>

              {followUpContacts.length === 0 && (
                <div style={{ padding: "24px 18px", textAlign: "center", color: "#80859a", fontSize: "13px" }}>
                  No pending follow-ups
                </div>
              )}

              {followUpContacts.map((contact, i) => {
                const [bg, color] = (AVATAR_COLORS[i % AVATAR_COLORS.length]).split("/");
                const age = daysSince(contact.followUpAt);
                return (
                  <div
                    key={contact.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "13px 18px",
                      borderBottom: i < followUpContacts.length - 1 ? "1px solid #f5f6f9" : "none",
                    }}
                  >
                    <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: bg, color, fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {initials(contact.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#15171d" }}>{contact.name}</div>
                      {contact.notes && (
                        <div style={{ fontSize: "12px", color: "#80859a", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {contact.notes}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#80859a", flexShrink: 0 }}>{age}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
