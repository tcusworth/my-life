import type { TypedPocketBase } from "@/types/pocketbase";
import type { InboxExtraction } from "@/lib/ai/extract-inbox";
import type { InboxProcessingResult } from "@/types/pocketbase";
import type { Area, Contact, Project } from "@/types/pocketbase";

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

function parseDate(value?: string | null) {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

export async function applyInboxExtraction(
  pb: TypedPocketBase,
  userId: string,
  extraction: InboxExtraction
): Promise<InboxProcessingResult> {
  const result: InboxProcessingResult = {
    tasksCreated: 0,
    projectsCreated: 0,
    contactsCreated: 0,
    followUpsCreated: 0,
    areasCreated: 0,
  };

  const [areas, projects, contacts] = await Promise.all([
    pb.collection("areas").getFullList<Area>(),
    pb.collection("projects").getFullList<Project>(),
    pb.collection("contacts").getFullList<Contact>(),
  ]);

  const areaByName = new Map(areas.map((a) => [normalizeName(a.name), a]));
  const projectByName = new Map(projects.map((p) => [normalizeName(p.name), p]));
  const contactByName = new Map(contacts.map((c) => [normalizeName(c.name), c]));

  async function ensureArea(name?: string | null) {
    if (!name?.trim()) return undefined;
    const key = normalizeName(name);
    const existing = areaByName.get(key);
    if (existing) return existing.id;

    const created = (await pb.collection("areas").create({
      user: userId,
      name: name.trim(),
      sortOrder: areas.length + areaByName.size,
    })) as Area;
    areaByName.set(key, created);
    result.areasCreated += 1;
    return created.id;
  }

  async function ensureProject(name?: string | null, areaName?: string | null) {
    if (!name?.trim()) return undefined;
    const key = normalizeName(name);
    const existing = projectByName.get(key);
    if (existing) return existing.id;

    const areaId = await ensureArea(areaName);
    const created = (await pb.collection("projects").create({
      user: userId,
      name: name.trim(),
      area: areaId,
      status: "active",
      sortOrder: projects.length + projectByName.size,
    })) as Project;
    projectByName.set(key, created);
    result.projectsCreated += 1;
    return created.id;
  }

  async function ensureContact(input: {
    name: string;
    email?: string | null;
    phone?: string | null;
    company?: string | null;
    notes?: string | null;
    followUpAt?: string | null;
  }) {
    const key = normalizeName(input.name);
    const existing = contactByName.get(key);
    if (existing) {
      const followUpAt = parseDate(input.followUpAt);
      if (followUpAt && !existing.followUpAt) {
        await pb.collection("contacts").update(existing.id, { followUpAt });
      }
      return existing.id;
    }

    const created = (await pb.collection("contacts").create({
      user: userId,
      name: input.name.trim(),
      email: input.email ?? undefined,
      phone: input.phone ?? undefined,
      company: input.company ?? undefined,
      notes: input.notes ?? undefined,
      followUpAt: parseDate(input.followUpAt),
    })) as Contact;
    contactByName.set(key, created);
    result.contactsCreated += 1;
    return created.id;
  }

  for (const project of extraction.projects) {
    await ensureProject(project.name, project.areaName);
  }

  for (const contact of extraction.contacts) {
    await ensureContact(contact);
  }

  for (const task of extraction.tasks) {
    const projectId = await ensureProject(task.projectName);
    const contactId = task.contactName
      ? await ensureContact({ name: task.contactName })
      : undefined;

    await pb.collection("tasks").create({
      user: userId,
      title: task.title.trim(),
      description: task.description ?? undefined,
      status: "inbox",
      priority: task.priority ?? undefined,
      dueAt: parseDate(task.dueAt),
      followUpAt: parseDate(task.followUpAt),
      project: projectId,
      contact: contactId,
    });
    result.tasksCreated += 1;
  }

  for (const followUp of extraction.followUps) {
    const contactId = followUp.contactName
      ? await ensureContact({ name: followUp.contactName })
      : undefined;
    const followUpAt = parseDate(followUp.followUpAt);

    await pb.collection("tasks").create({
      user: userId,
      title: followUp.title.trim(),
      description: followUp.description ?? undefined,
      status: "inbox",
      followUpAt,
      contact: contactId,
    });
    result.tasksCreated += 1;

    await pb.collection("activities").create({
      user: userId,
      type: "follow_up",
      title: followUp.title.trim(),
      notes: followUp.description ?? undefined,
      contact: contactId,
      followUpAt,
    });
    result.followUpsCreated += 1;
  }

  return result;
}
