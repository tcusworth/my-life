"use server";

import { revalidatePath } from "next/cache";
import { applyInboxExtraction } from "@/lib/ai/apply-extraction";
import { extractInboxContent } from "@/lib/ai/extract-inbox";
import {
  isExtractionEmpty,
  reviewItemsToExtraction,
  type ReviewItem,
} from "@/lib/ai/inbox-review";
import { isOpenAiConfigured } from "@/lib/config/environment";
import { AppError } from "@/lib/errors/app-errors";
import {
  checkGoogleOAuth,
  checkPocketBaseHealth,
} from "@/lib/health/checks";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import type { InboxProcessingResult } from "@/types/pocketbase";
import type { Area, Contact, Project } from "@/types/pocketbase";
import type { InboxExtraction } from "@/lib/ai/extract-inbox";

async function requireAuthenticatedClient() {
  const pb = await getAuthenticatedClient();
  if (!pb?.authStore.record) {
    throw new AppError("UNAUTHORIZED", "You must be signed in.");
  }
  return { pb, userId: pb.authStore.record.id };
}

async function assertPocketBaseReachable() {
  const health = await checkPocketBaseHealth();
  if (!health.ok) {
    throw new AppError(
      "POCKETBASE_UNREACHABLE",
      health.message ?? "PocketBase is unreachable"
    );
  }
}

async function loadExtractionContext(pb: Awaited<ReturnType<typeof getAuthenticatedClient>>) {
  const [areas, projects, contacts] = await Promise.all([
    pb!.collection("areas").getFullList<Area>(),
    pb!.collection("projects").getFullList<Project>(),
    pb!.collection("contacts").getFullList<Contact>(),
  ]);

  return {
    existingAreas: areas.map((area) => area.name),
    existingProjects: projects.map((project) => project.name),
    existingContacts: contacts.map((contact) => contact.name),
  };
}

export async function extractInboxText(text: string): Promise<InboxExtraction> {
  await assertPocketBaseReachable();

  if (!isOpenAiConfigured()) {
    throw new AppError(
      "MISSING_OPENAI_KEY",
      "OPENAI_API_KEY is not configured on the server."
    );
  }

  const { pb } = await requireAuthenticatedClient();
  const trimmed = text.trim();

  if (!trimmed) {
    throw new AppError("INVALID_INPUT", "Paste some inbox text to process.");
  }

  if (trimmed.length > 20000) {
    throw new AppError("INVALID_INPUT", "Inbox text is too long (max 20,000 characters).");
  }

  const context = await loadExtractionContext(pb);

  let extraction: InboxExtraction;
  try {
    extraction = await extractInboxContent(trimmed, context);
  } catch (error) {
    throw new AppError(
      "AI_EXTRACTION_FAILED",
      error instanceof Error ? error.message : "AI extraction failed"
    );
  }

  if (isExtractionEmpty(extraction)) {
    throw new AppError(
      "EMPTY_EXTRACTION",
      "No tasks, projects, contacts, or follow-ups were found in that text."
    );
  }

  return extraction;
}

export async function approveInboxItems(
  items: ReviewItem[]
): Promise<InboxProcessingResult> {
  await assertPocketBaseReachable();

  const { pb, userId } = await requireAuthenticatedClient();
  const extraction = reviewItemsToExtraction(items);

  if (isExtractionEmpty(extraction)) {
    throw new AppError(
      "EMPTY_EXTRACTION",
      "Select at least one item to create."
    );
  }

  try {
    const result = await applyInboxExtraction(pb, userId, extraction);

    revalidatePath("/inbox");
    revalidatePath("/dashboard");
    revalidatePath("/projects");
    revalidatePath("/today");

    return result;
  } catch (error) {
    throw new AppError(
      "APPLY_FAILED",
      error instanceof Error ? error.message : "Failed to create records"
    );
  }
}

export async function checkInboxReadiness() {
  const [pocketbase, oauth, openaiConfigured] = await Promise.all([
    checkPocketBaseHealth(),
    checkGoogleOAuth(),
    Promise.resolve(isOpenAiConfigured()),
  ]);

  return {
    pocketbase,
    oauth,
    openai: {
      ok: openaiConfigured,
      message: openaiConfigured ? undefined : "OPENAI_API_KEY is not set",
    },
    ready: pocketbase.ok && oauth.ok && openaiConfigured,
  };
}
