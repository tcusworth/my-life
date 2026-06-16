"use client";

import { useState } from "react";

const projects = [
  { name: "Series A raise", area: "Work", areaColor: "#29a8b2", status: "On track", statusBg: "#e9f6f7", statusColor: "#1d7a82", desc: "Close $4M round with lead investor.", progress: 72, tasksLabel: "13 of 18 tasks", due: "Closes in 6 days", goal: "Raise the Series A" },
  { name: "Q3 product launch", area: "Work", areaColor: "#29a8b2", status: "In progress", statusBg: "#fdf4e0", statusColor: "#b17d1f", desc: "Ship the v2 collaboration suite.", progress: 45, tasksLabel: "9 of 20 tasks", due: "Due Sep 1", goal: "Ship the v2 platform" },
  { name: "Hire design lead", area: "Work", areaColor: "#29a8b2", status: "Final round", statusBg: "#fdeee6", statusColor: "#b84a1f", desc: "Senior IC to own product design.", progress: 80, tasksLabel: "4 of 5 tasks", due: "Offer this week", goal: "Ship the v2 platform" },
  { name: "Marathon training", area: "Health", areaColor: "#eb6532", status: "On track", statusBg: "#e9f6f7", statusColor: "#1d7a82", desc: "Chicago marathon — sub 3:30 goal.", progress: 60, tasksLabel: "Week 12 of 18", due: "Race Oct 12", goal: "Run Chicago sub-3:30" },
  { name: "Home renovation", area: "Family", areaColor: "#674197", status: "In progress", statusBg: "#fdf4e0", statusColor: "#b17d1f", desc: "Kitchen + back deck remodel.", progress: 35, tasksLabel: "7 of 22 tasks", due: "Contractor Fri", goal: "Be present at home" },
  { name: "Italy trip", area: "Family", areaColor: "#674197", status: "Planning", statusBg: "#fdf4e0", statusColor: "#b17d1f", desc: "Two weeks, Rome → Amalfi in August.", progress: 25, tasksLabel: "5 of 16 tasks", due: "Depart Aug 9", goal: "Be present at home" },
];

const templates = [
  { name: "Client project", desc: "Kickoff, deliverables, and feedback loops.", icon: "💼", soft: "#e9f6f7", color: "#1d7a82" },
  { name: "Trip planning", desc: "Flights, hotels, and itinerary in one place.", icon: "✈️", soft: "#fdf4e0", color: "#b17d1f" },
  { name: "Product launch", desc: "GTM checklist, metrics, and launch day.", icon: "🚀", soft: "#fdeee6", color: "#b84a1f" },
  { name: "Hiring loop", desc: "Pipeline, scorecards, and offer workflow.", icon: "👥", soft: "#efe9f5", color: "#4a2d6e" },
];

const initialBoardCards = [
  { id: "b1", title: "Finalize pitch deck v4", col: "progress", who: "TC", color: "#29a8b2", due: "Today", prio: "#eb6532" },
  { id: "b2", title: "Update cap table model", col: "progress", who: "DO", color: "#674197", due: "Wed", prio: "#f0ae35" },
  { id: "b3", title: "Build investor data room", col: "backlog", who: "TC", color: "#29a8b2", due: "Thu", prio: "#80859a" },
  { id: "b4", title: "Legal: SAFE review", col: "review", who: "LG", color: "#b17d1f", due: "Fri", prio: "#eb6532" },
  { id: "b5", title: "Draft lead term sheet", col: "backlog", who: "DO", color: "#674197", due: "Next wk", prio: "#f0ae35" },
  { id: "b6", title: "Seed investor intros", col: "done", who: "TC", color: "#29a8b2", due: "—", prio: "#2f8f5e" },
];

const projectNotes = [
  { title: "Investor Q&A prep", snippet: "47 questions, answers drafted for 38. Focus on ARR growth...", accent: "#29a8b2" },
  { title: "Term sheet red lines", snippet: "No board seat for < $1M check. Anti-dilution: broad-based...", accent: "#eb6532" },
];

const projectFiles = [
  { letter: "P", name: "Pitch deck v4.pdf", meta: "2.4 MB · Updated today", color: "#29a8b2" },
  { letter: "M", name: "Cap table model.xlsx", meta: "840 KB · Updated Wed", color: "#2f8f5e" },
  { letter: "D", name: "Data room index.notion", meta: "Link · 14 docs", color: "#674197" },
];

const projectActivity = [
  { who: "TC", action: "Moved \"Finalize pitch deck\" to In progress", when: "Today · 9:14 AM", color: "#29a8b2" },
  { who: "DO", action: "Uploaded Cap table model v3.xlsx", when: "Yesterday · 4:32 PM", color: "#674197" },
  { who: "LG", action: "Commented on Legal: SAFE review", when: "Yesterday · 2:10 PM", color: "#b17d1f" },
  { who: "TC", action: "Created project \"Series A raise\"", when: "Jun 1 · 8:00 AM", color: "#29a8b2" },
];

const boardColumns = [
  { id: "backlog", label: "Backlog", color: "#b3b7c6" },
  { id: "progress", label: "In progress", color: "#29a8b2" },
  { id: "review", label: "In review", color: "#f0ae35" },
  { id: "done", label: "Done", color: "#2f8f5e" },
];

const filterOptions = ["All", "Work", "Health", "Family"];

type Project = typeof projects[0];
type BoardCard = typeof initialBoardCards[0];

export default function ProjectsPage() {
  const [projectFilter, setProjectFilter] = useState("All");
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const [boardCards, setBoardCards] = useState<BoardCard[]>(initialBoardCards);
  const [dragCard, setDragCard] = useState<string | null>(null);
  const [projectTab, setProjectTab] = useState<"board" | "overview" | "activity">("board");

  const filteredProjects = projectFilter === "All"
    ? projects
    : projects.filter(p => p.area === projectFilter);

  const handleDragStart = (cardId: string) => {
    setDragCard(cardId);
  };

  const handleDrop = (colId: string) => {
    if (!dragCard) return;
    setBoardCards(prev => prev.map(c => c.id === dragCard ? { ...c, col: colId } : c));
    setDragCard(null);
  };

  if (openProject) {
    const colCards = (colId: string) => boardCards.filter(c => c.col === colId);

    return (
      <div style={{ padding: "26px 32px", maxWidth: 1320, margin: "0 auto" }}>
        <button
          onClick={() => { setOpenProject(null); setProjectTab("board"); }}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500, color: "#5b606f", padding: 0, marginBottom: 16 }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
          All projects
        </button>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 20 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: openProject.areaColor, display: "inline-block" }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#80859a" }}>{openProject.area} · ladders up to {openProject.goal}</span>
            </div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em", color: "#0f1014", margin: 0 }}>{openProject.name}</h1>
            <p style={{ fontSize: 14.5, color: "#5b606f", margin: "8px 0 0" }}>{openProject.desc}</p>
          </div>
          <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 11px", borderRadius: 999, background: openProject.statusBg, color: openProject.statusColor }}>{openProject.status}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
              <span style={{ fontSize: 12.5, color: "#80859a" }}>{openProject.tasksLabel}</span>
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color: openProject.areaColor }}>{openProject.progress}%</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #d7dae3", marginBottom: 20 }}>
          {(["board", "overview", "activity"] as const).map(tab => (
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, alignItems: "start" }}>
            {boardColumns.map(col => {
              const cards = colCards(col.id);
              return (
                <div
                  key={col.id}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => handleDrop(col.id)}
                  style={{ background: "#f3efe5", borderRadius: 14, padding: 12, display: "flex", flexDirection: "column", gap: 10, minHeight: 240 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px 6px" }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: col.color, display: "inline-block" }} />
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "#2c2f3a" }}>{col.label}</span>
                    <span style={{ fontSize: 11.5, color: "#b3b7c6", fontFamily: "'JetBrains Mono', monospace" }}>{cards.length}</span>
                  </div>
                  {cards.map(card => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(card.id)}
                      style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 11, padding: 12, boxShadow: "0 1px 2px rgba(15,16,20,0.04)", cursor: "grab" }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#15171d", lineHeight: 1.35, marginBottom: 11 }}>{card.title}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ width: 24, height: 24, borderRadius: 7, background: card.color, color: "#fff", fontSize: 10.5, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>{card.who}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{ fontSize: 11, color: "#80859a", fontFamily: "'JetBrains Mono', monospace" }}>{card.due}</span>
                          <span style={{ width: 7, height: 7, borderRadius: 999, background: card.prio, display: "inline-block" }} />
                        </div>
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
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {projectNotes.map((note, i) => (
                    <div key={i} style={{ display: "flex", gap: 11, padding: "12px 14px", border: "1px solid #eceef3", borderRadius: 12 }}>
                      <span style={{ width: 4, alignSelf: "stretch", borderRadius: 3, background: note.accent, flexShrink: 0, display: "inline-block" }} />
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#15171d" }}>{note.title}</div>
                        <div style={{ fontSize: 12.5, color: "#80859a", marginTop: 2 }}>{note.snippet}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, padding: 20, boxShadow: "0 1px 2px rgba(15,16,20,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, color: "#0f1014", margin: 0 }}>Files</h3>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "#1d7a82", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V8M6 14l6-6 6 6M5 4h14" /></svg>
                    Upload
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {projectFiles.map((file, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ width: 34, height: 34, borderRadius: 9, background: file.color, color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{file.letter}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500, color: "#15171d" }}>{file.name}</div>
                        <div style={{ fontSize: 12, color: "#80859a" }}>{file.meta}</div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b3b7c6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v12M7 11l5 5 5-5M5 20h14" /></svg>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "linear-gradient(160deg,#0f4247,#1d7a82)", borderRadius: 16, padding: 20, color: "#fff" }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#9fe3da", marginBottom: 8 }}>Ladders up to</div>
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 500, margin: "0 0 14px", color: "#fff" }}>{openProject.goal}</p>
                <div style={{ height: 7, borderRadius: 999, background: "rgba(255,255,255,0.2)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${openProject.progress}%`, background: "#fff", borderRadius: 999 }} />
                </div>
                <div style={{ fontSize: 12.5, color: "#9fe3da", marginTop: 9 }}>{openProject.progress}% · {openProject.tasksLabel}</div>
              </div>
              <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, padding: 20, boxShadow: "0 1px 2px rgba(15,16,20,0.05)" }}>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, color: "#0f1014", margin: "0 0 12px" }}>Key info</h3>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0" }}>
                  <span style={{ fontSize: 13, color: "#80859a" }}>Status</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: openProject.statusBg, color: openProject.statusColor }}>{openProject.status}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderTop: "1px solid #f5f6f9" }}>
                  <span style={{ fontSize: 13, color: "#80859a" }}>Area</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#15171d" }}>{openProject.area}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderTop: "1px solid #f5f6f9" }}>
                  <span style={{ fontSize: 13, color: "#80859a" }}>Due</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#15171d" }}>{openProject.due}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {projectTab === "activity" && (
          <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, padding: 24, boxShadow: "0 1px 2px rgba(15,16,20,0.05)", maxWidth: 720 }}>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, color: "#0f1014", margin: "0 0 18px" }}>Activity</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {projectActivity.map((ac, i) => (
                <div key={i} style={{ display: "flex", gap: 13, alignItems: "flex-start", paddingBottom: 18 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, background: ac.color, color: "#fff", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ac.who}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, color: "#2c2f3a" }}>{ac.action}</div>
                    <div style={{ fontSize: 12, color: "#b3b7c6", marginTop: 2 }}>{ac.when}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 1320, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 34, fontWeight: 500, letterSpacing: "-0.02em", color: "#0f1014", margin: 0 }}>
            Everything you&apos;re <span style={{ fontStyle: "italic", color: "#29a8b2" }}>building</span>.
          </h1>
          <p style={{ fontSize: 15, color: "#5b606f", margin: "9px 0 0" }}>8 active projects across 4 areas of your life.</p>
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          {filterOptions.map(f => (
            <span
              key={f}
              onClick={() => setProjectFilter(f)}
              style={{
                fontSize: 12.5,
                fontWeight: 500,
                padding: "7px 14px",
                borderRadius: 999,
                background: projectFilter === f ? "#15171d" : "#ffffff",
                color: projectFilter === f ? "#faf7f1" : "#5b606f",
                border: `1px solid ${projectFilter === f ? "#15171d" : "#d7dae3"}`,
                cursor: "pointer",
                transition: "all 160ms",
              }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#80859a", marginBottom: 12 }}>Start from a template</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {templates.map((tp, i) => (
            <button
              key={i}
              style={{ textAlign: "left" as const, background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 13, padding: 15, cursor: "pointer", fontFamily: "inherit", display: "flex", flexDirection: "column", gap: 9, transition: "border-color 160ms, transform 160ms" }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 9, background: tp.soft, color: tp.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{tp.icon}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#15171d" }}>{tp.name}</div>
              <div style={{ fontSize: 12, color: "#80859a", lineHeight: 1.4 }}>{tp.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {filteredProjects.map((p, i) => (
          <div
            key={i}
            onClick={() => setOpenProject(p)}
            style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, padding: 20, boxShadow: "0 1px 2px rgba(15,16,20,0.05)", cursor: "pointer", transition: "box-shadow 260ms, transform 260ms" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: p.areaColor, display: "inline-block" }} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#80859a" }}>{p.area}</span>
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: p.statusBg, color: p.statusColor }}>{p.status}</span>
            </div>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 600, color: "#0f1014", margin: "0 0 4px", letterSpacing: "-0.01em" }}>{p.name}</h3>
            <p style={{ fontSize: 13, color: "#80859a", margin: "0 0 18px", lineHeight: 1.45 }}>{p.desc}</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ fontSize: 12, color: "#5b606f" }}>{p.tasksLabel}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: p.areaColor }}>{p.progress}%</span>
            </div>
            <div style={{ height: 7, borderRadius: 999, background: "#f5f6f9", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${p.progress}%`, borderRadius: 999, background: p.areaColor }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 15, paddingTop: 14, borderTop: "1px solid #f5f6f9" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b3b7c6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></svg>
              <span style={{ fontSize: 12, color: "#80859a" }}>{p.due}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
