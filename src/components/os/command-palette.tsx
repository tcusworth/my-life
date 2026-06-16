"use client";

import { useEffect, useState } from "react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-24">
      <div className="w-full max-w-lg rounded-xl border bg-white p-3">
        <input
          className="w-full border px-3 py-2 rounded-md text-sm"
          placeholder="Type command…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          className="mt-3 w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-sm"
          onClick={async () => {
            try {
              const response = await fetch("/api/os-command", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  type: "TASK_CREATE",
                  payload: {
                    title: query || "Untitled task",
                    status: "inbox",
                  },
                  meta: {
                    source: "ui",
                  },
                }),
              });

              const result = await response.json();

              console.log("[OS RESULT]", result);

              setOpen(false);
              setQuery("");
            } catch (error) {
              console.error(error);
            }
          }}
        >
          Create Task
        </button>
      </div>
    </div>
  );
}