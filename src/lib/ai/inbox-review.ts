import type {
  ExtractedContact,
  ExtractedFollowUp,
  ExtractedProject,
  ExtractedTask,
  InboxExtraction,
} from "@/lib/ai/extract-inbox";

export type ReviewItemType = "task" | "project" | "contact" | "followUp";

interface ReviewItemBase {
  id: string;
  selected: boolean;
}

export type ReviewTask = ReviewItemBase & ExtractedTask & { type: "task" };
export type ReviewProject = ReviewItemBase & ExtractedProject & { type: "project" };
export type ReviewContact = ReviewItemBase & ExtractedContact & { type: "contact" };
export type ReviewFollowUp = ReviewItemBase & ExtractedFollowUp & { type: "followUp" };

export type ReviewItem = ReviewTask | ReviewProject | ReviewContact | ReviewFollowUp;

export function extractionToReviewItems(extraction: InboxExtraction): ReviewItem[] {
  return [
    ...extraction.projects.map((project) => ({
      ...project,
      id: crypto.randomUUID(),
      selected: true,
      type: "project" as const,
    })),
    ...extraction.contacts.map((contact) => ({
      ...contact,
      id: crypto.randomUUID(),
      selected: true,
      type: "contact" as const,
    })),
    ...extraction.tasks.map((task) => ({
      ...task,
      id: crypto.randomUUID(),
      selected: true,
      type: "task" as const,
    })),
    ...extraction.followUps.map((followUp) => ({
      ...followUp,
      id: crypto.randomUUID(),
      selected: true,
      type: "followUp" as const,
    })),
  ];
}

export function reviewItemsToExtraction(items: ReviewItem[]): InboxExtraction {
  return {
    projects: items
      .filter((item): item is ReviewProject => item.type === "project" && item.selected)
      .map(({ id: _id, selected: _selected, type: _type, ...project }) => project),
    contacts: items
      .filter((item): item is ReviewContact => item.type === "contact" && item.selected)
      .map(({ id: _id, selected: _selected, type: _type, ...contact }) => contact),
    tasks: items
      .filter((item): item is ReviewTask => item.type === "task" && item.selected)
      .map(({ id: _id, selected: _selected, type: _type, ...task }) => task),
    followUps: items
      .filter((item): item is ReviewFollowUp => item.type === "followUp" && item.selected)
      .map(({ id: _id, selected: _selected, type: _type, ...followUp }) => followUp),
  };
}

export function countSelectedItems(items: ReviewItem[]) {
  return items.filter((item) => item.selected).length;
}

export function isExtractionEmpty(extraction: InboxExtraction) {
  return (
    extraction.tasks.length === 0 &&
    extraction.projects.length === 0 &&
    extraction.contacts.length === 0 &&
    extraction.followUps.length === 0
  );
}
