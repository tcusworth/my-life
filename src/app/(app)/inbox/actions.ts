"use server";

import { revalidatePath } from "next/cache";
import { applyInboxExtraction } from "@/lib/ai/apply-extraction";
import { extractInboxContent } from "@/lib/ai/extract-inbox";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import type { InboxProcessingResult } from "@/types/pocketbase";
import type { Area, Contact, Project } from "@/types/pocketbase";

export async function processInboxText(
  formData: FormData
): Promise<InboxProcessingResult> {
  const pb = await getAuthenticatedClient();
  if (!pb?.authStore.record) {
    throw new Error("Unauthorized");
  }

  const text = String(formData.get("text") ?? "").trim();
  if (!text) {
    throw new Error("Paste some inbox text to process");
  }

  if (text.length > 20000) {
    throw new Error("Inbox text is too long (max 20,000 characters)");
  }

  const userId = pb.authStore.record.id;

  const [areas, projects, contacts] = await Promise.all([
    pb.collection("areas").getFullList<Area>(),
    pb.collection("projects").getFullList<Project>(),
    pb.collection("contacts").getFullList<Contact>(),
  ]);

  const extraction = await extractInboxContent(text, {
    existingAreas: areas.map((area) => area.name),
    existingProjects: projects.map((project) => project.name),
    existingContacts: contacts.map((contact) => contact.name),
  });

  const result = await applyInboxExtraction(pb, userId, extraction);

  revalidatePath("/inbox");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/today");

  return result;
}
