"use server";

import { revalidatePath } from "next/cache";
import { AppError } from "@/lib/errors/app-errors";
import { checkPocketBaseHealth } from "@/lib/health/checks";
import { seedDefaultAreasForUser } from "@/lib/seed/seed-areas";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";

export async function seedDefaultAreasAction() {
  const health = await checkPocketBaseHealth();
  if (!health.ok) {
    throw new AppError(
      "POCKETBASE_UNREACHABLE",
      health.message ?? "PocketBase is unreachable"
    );
  }

  const pb = await getAuthenticatedClient();
  if (!pb?.authStore.record) {
    throw new AppError("UNAUTHORIZED", "You must be signed in.");
  }

  const result = await seedDefaultAreasForUser(pb, pb.authStore.record.id);

  revalidatePath("/settings/setup");
  revalidatePath("/dashboard");
  revalidatePath("/projects");

  return result;
}
