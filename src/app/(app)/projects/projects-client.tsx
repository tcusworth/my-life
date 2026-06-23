"use client";

import { useState, useCallback } from "react";

interface Area {
  id: string;
  name: string;
  color?: string;
}

interface Project {
  id: string;
  name: string;
  color?: string;
  status: string;
  sortOrder?: number;
  expand?: { area?: Area };
}

interface Task {
  id: string;
  project?: string;
  title: string;
  status: string;
  priority?: string;
  dueAt?: string;
}

interface Note {
  id: string;
  project?: string;
  title: string;
  content?: string;
}

interface Props {
  projects: Project[];
  tasks: Task[];
  notes: Note[];
}

const BOARD_COLUMNS = [
  { id: "inbox", label: "Inbox", color: "#b3b7c6" },
  { id: "active", label: "Active", color: "#29a8b2" },
  { id: "someday", label: "Someday", color: "#674197" },
];

function priorityColor(priority?: string): string {
  if (priority === "urgent") return "#eb6532";
  if (priority === "high") return "#f0ae35";
  if (priority === "low") return "#2f8f5e";
  return "#b3b7c6";
}

function formatDue(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr.slice(0, 10) + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" } as Intl.DateTimeFormatOptions);
}

export default function ProjectsClient({ projects, tasks, notes }: Props) {
  const [areaFilter, setAreaFilter] = useState("All");
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [projectTab, setProjectTab] = useState<"board" | "overview">("board");
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);

  const areaOptions = [
    "All",
    ...Array.from(new Set(projects.map((p) => p.expand?.area?.name).filter(Boolean) as string[])),
  ];

  const filteredProjects =
    areaFilter === "All"
      ? projects
      : projects.filter((p) => p.expand?.area?.name === areaFilter);

  const openProject = openProjectId ? projects.find((p) => p.id === openProjectId) ?? null : null;

  const tasksByProject = useCallback(
    (projectId: string) => localTasks.filter((t) => t.project === projectId),
    [localTasks]
  );

  const notesByProject = useCallback(
    (projectId: string) => notes.filter((n) => n.project === projectId),
    [notes]
  );

  const handleDragStart = (taskId: string) => setDragTaskId(taskId);

  const handleDrop = async (colId: string) => {
    if (!dragTaskId) return;
    const prev = localTasks;
    setLocalTasks((ts) => ts.map((t) => (t.id === dragTaskId ? { ...t, status: colId } : t)));
    setDragTaskId(null);
    try {
      await fetch(`/api/tasks/${dragTaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: colId }),
      });
    } catch {
      setLocalTasks(prev);
    }
  };

  if (openProject) {
    const areaColor = openProject.expand?.area?.color || "#d7dae3";
    const areaName = openProject.expand?.area?.name || "";
    const projectTasks = tasksByProject(openProject.id);
    const projectNotes = notesByProject(openProject.id);
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter((t) => t.status === "completed").length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const activeTasks = projectTasks.filter((t) => t.status !== "completed" && t.status !== "cancelled").length;

    return (
      <div style={{ padding: "26px 32px", maxWidth: 1320, margin: "0 auto" }}>
        <button
          onClick={() => { setOpenProjectId(null); setProjectTab("board"); }}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500, color: "#5b606f", padding: 0, marginBottom: 16 }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
          All projects
        </button>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 20 }}>
          <div style={{ minWidth: 0 }}>
            {areaName && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: areaColor, display: "inline-block" }} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#80859a" }}>{areaName}</span>
              </div>
            )}
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em", color: "#0f1014", margin: 0 }}>{openProject.name}</h1>
          </div>
          <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 11px", borderRadius: 999, background: "#eef6ee", color: "#1a7a2a" }}>Active</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
              <span style={{ fontSize: 12.5, color: "#80859a" }}>{activeTasks} tasks remaining</span>
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color: areaColor }}>{progress}%</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #d7dae3", marginBottom: 20 }}>
          {(["board", "overview"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setProjectTab(tab)}
              style={{ padding: "9px 16px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, color: projectTab === tab ? "#15171d" : "#80859a", borderBottom: `2px solid ${projectTab === tab ? "#29a8b2" : "transparent"}`, marginBottom: -1 }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {projectTab === "board" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, alignItems: "start" }}>
            {BOARD_COLUMNS.map((col) => {
              const colTasks = projectTasks.filter((t) => t.status === col.id);
              return (
                <div
                  key={col.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(col.id)}
                  style={{ background: "#f3efe5", borderRadius: 14, padding: 12, display: "flex", flexDirection: "column", gap: 10, minHeight: 240 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px 6px" }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: col.color, display: "inline-block" }} />
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "#2c2f3a" }}>{col.label}</span>
                    <span style={{ fontSize: 11.5, color: "#b3b7c6", fontFamily: "'JetBrains Mono', monospace" }}>{colTasks.length}</span>
                  </div>
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 11, padding: 12, boxShadow: "0 1px 2px rgba(15,16,20,0.04)", cursor: "grab" }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#15171d", lineHeight: 1.35, marginBottom: 11 }}>{task.title}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 7 }}>
                        {task.dueAt && (
                          <span style={{ fontSize: 11, color: "#80859a", fontFamily: "'JetBrains Mono', monospace" }}>{formatDue(task.dueAt)}</span>
                        )}
                        <span style={{ width: 7, height: 7, borderRadius: 999, background: priorityColor(task.priority), display: "inline-block" }} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {projectTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, padding: 20, boxShadow: "0 1px 2px rgba(15,16,20,0.05)" }}>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, color: "#0f1014", margin: "0 0 14px" }}>Linked notes</h3>
                {projectNotes.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#80859a", margin: 0 }}>No notes linked to this project.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {projectNotes.map((note) => (
                      <div key={note.id} style={{ display: "flex", gap: 11, padding: "12px 14px", border: "1px solid #eceef3", borderRadius: 12 }}>
                        <span style={{ width: 4, alignSelf: "stretch", borderRadius: 3, background: areaColor, flexShrink: 0, display: "inline-block" }} />
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: "#15171d" }}>{note.title}</div>
                          {note.content && (
                            <div style={{ fontSize: 12.5, color: "#80859a", marginTop: 2 }}>
                              {note.content.slice(0, 120)}{note.content.length > 120 ? "…" : ""}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, padding: 20, boxShadow: "0 1px 2px rgba(15,16,20,0.05)" }}>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, color: "#0f1014", margin: "0 0 12px" }}>Key info</h3>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0" }}>
                  <span style={{ fontSize: 13, color: "#80859a" }}>Status</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: "#eef6ee", color: "#1a7a2a" }}>Active</span>
                </div>
                {areaName && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderTop: "1px solid #f5f6f9" }}>
                    <span style={{ fontSize: 13, color: "#80859a" }}>Area</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#15171d" }}>{areaName}</span>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderTop: "1px solid #f5f6f9" }}>
                  <span style={{ fontSize: 13, color: "#80859a" }}>Tasks</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#15171d" }}>{completedTasks} / {totalTasks} done</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderTop: "1px solid #f5f6f9" }}>
                  <span style={{ fontSize: 13, color: "#80859a" }}>Progress</span>
                  <span style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, color: areaColor }}>{progress}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const activeCount = projects.filter((p) => p.status === "active").length;

  return (
    <div style={{ padding: 32, maxWidth: 1320, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 34, fontWeight: 500, letterSpacing: "-0.02em", color: "#0f1014", margin: 0 }}>
            Everything you&apos;re <span style={{ fontStyle: "italic", color: "#29a8b2" }}>building</span>.
          </h1>
          <p style={{ fontSize: 15, color: "#5b606f", margin: "9px 0 0" }}>
            {activeCount} active project{activeCount !== 1 ? "s" : ""} across your areas of life.
          </p>
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          {areaOptions.map((f) => (
            <span
              key={f}
              onClick={() => setAreaFilter(f)}
              style={{
                fontSize: 12.5,
                fontWeight: 500,
                padding: "7px 14px",
                borderRadius: 999,
                background: areaFilter === f ? "#15171d" : "#ffffff",
                color: areaFilter === f ? "#faf7f1" : "#5b606f",
                border: `1px solid ${areaFilter === f ? "#15171d" : "#d7dae3"}`,
                cursor: "pointer",
                transition: "all 160ms",
              }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {filteredProjects.length === 0 && (
        <div style={{ textAlign: "center", color: "#80859a", fontSize: 15, padding: "60px 0" }}>
          No projects yet. Create your first project to get started.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {filteredProjects.map((p) => {
          const areaColor = p.expand?.area?.color || "#d7dae3";
          const areaName = p.expand?.area?.name || "";
          const pTasks = tasksByProject(p.id);
          const total = pTasks.length;
          const completed = pTasks.filter((t) => t.status === "completed").length;
          const active = pTasks.filter((t) => t.status !== "completed" && t.status !== "cancelled").length;
          const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <div
              key={p.id}
              onClick={() => setOpenProjectId(p.id)}
              style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, padding: 20, boxShadow: "0 1px 2px rgba(15,16,20,0.05)", cursor: "pointer", transition: "box-shadow 260ms, transform 260ms" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {areaName && (
                    <>
                      <span style={{ width: 9, height: 9, borderRadius: 3, background: areaColor, display: "inline-block" }} />
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#80859a" }}>{areaName}</span>
                    </>
                  )}
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: "#eef6ee", color: "#1a7a2a" }}>Active</span>
              </div>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 600, color: "#0f1014", margin: "0 0 4px", letterSpacing: "-0.01em" }}>{p.name}</h3>
              <p style={{ fontSize: 13, color: "#80859a", margin: "0 0 18px", lineHeight: 1.45 }}>{active} task{active !== 1 ? "s" : ""} remaining</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 12, color: "#5b606f" }}>{completed} of {total} tasks</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: areaColor }}>{progress}%</span>
              </div>
              <div style={{ height: 7, borderRadius: 999, background: "#f5f6f9", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, borderRadius: 999, background: areaColor }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
