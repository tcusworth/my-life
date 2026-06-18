"use client";
import { useEffect } from "react";

export default function SyncOnMount() {
  useEffect(() => {
    fetch("/api/sync/google-calendar", { method: "POST" }).catch(() => {});
    fetch("/api/sync/outlook", { method: "POST" }).catch(() => {});
  }, []);
  return null;
}
