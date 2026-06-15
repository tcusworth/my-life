import type { TypedPocketBase } from "@/types/pocketbase";
import type { Area } from "@/types/pocketbase";
import { DEFAULT_AREAS } from "@/lib/seed/default-areas";

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

export interface SeedAreasResult {
  created: string[];
  skipped: string[];
}

export async function seedDefaultAreasForUser(
  pb: TypedPocketBase,
  userId: string
): Promise<SeedAreasResult> {
  const existing = await pb.collection("areas").getFullList<Area>();
  const existingNames = new Set(existing.map((area) => normalizeName(area.name)));

  const created: string[] = [];
  const skipped: string[] = [];

  for (const [index, name] of DEFAULT_AREAS.entries()) {
    if (existingNames.has(normalizeName(name))) {
      skipped.push(name);
      continue;
    }

    await pb.collection("areas").create({
      user: userId,
      name,
      sortOrder: index,
    });
    created.push(name);
    existingNames.add(normalizeName(name));
  }

  return { created, skipped };
}
