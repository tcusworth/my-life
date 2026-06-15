import type { TaskPriority } from "@/types/pocketbase";

export interface ExtractedTask {
  title: string;
  description?: string | null;
  dueAt?: string | null;
  followUpAt?: string | null;
  priority?: TaskPriority | null;
  projectName?: string | null;
  contactName?: string | null;
}

export interface ExtractedProject {
  name: string;
  areaName?: string | null;
  description?: string | null;
}

export interface ExtractedContact {
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  notes?: string | null;
  followUpAt?: string | null;
}

export interface ExtractedFollowUp {
  title: string;
  description?: string | null;
  followUpAt: string;
  contactName?: string | null;
}

export interface InboxExtraction {
  tasks: ExtractedTask[];
  projects: ExtractedProject[];
  contacts: ExtractedContact[];
  followUps: ExtractedFollowUp[];
}

const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    tasks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: ["string", "null"] },
          dueAt: { type: ["string", "null"], description: "ISO 8601 date or datetime" },
          followUpAt: { type: ["string", "null"], description: "ISO 8601 date or datetime" },
          priority: {
            type: ["string", "null"],
            enum: ["low", "medium", "high", "urgent", null],
          },
          projectName: { type: ["string", "null"] },
          contactName: { type: ["string", "null"] },
        },
        required: ["title"],
        additionalProperties: false,
      },
    },
    projects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          areaName: { type: ["string", "null"] },
          description: { type: ["string", "null"] },
        },
        required: ["name"],
        additionalProperties: false,
      },
    },
    contacts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: ["string", "null"] },
          phone: { type: ["string", "null"] },
          company: { type: ["string", "null"] },
          notes: { type: ["string", "null"] },
          followUpAt: { type: ["string", "null"] },
        },
        required: ["name"],
        additionalProperties: false,
      },
    },
    followUps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: ["string", "null"] },
          followUpAt: { type: "string", description: "ISO 8601 date or datetime" },
          contactName: { type: ["string", "null"] },
        },
        required: ["title", "followUpAt"],
        additionalProperties: false,
      },
    },
  },
  required: ["tasks", "projects", "contacts", "followUps"],
  additionalProperties: false,
} as const;

function buildSystemPrompt(today: string) {
  return `You extract structured productivity data from unstructured inbox text.
Today's date is ${today}.

Rules:
- Extract actionable tasks, implied projects, people/contacts, due dates, and follow-ups.
- Use ISO 8601 for all dates (YYYY-MM-DD or full datetime).
- Infer reasonable due dates when phrases like "tomorrow", "next week", or "Friday" appear.
- followUps are reminders to reconnect (calls, emails, check-ins) distinct from regular tasks.
- projectName and areaName should be short labels inferred from context.
- Do not invent contacts without evidence in the text.
- Return empty arrays when nothing applies.
- Respond with JSON matching the schema only.`;
}

export async function extractInboxContent(
  text: string,
  context: {
    existingAreas: string[];
    existingProjects: string[];
    existingContacts: string[];
  }
): Promise<InboxExtraction> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const today = new Date().toISOString().slice(0, 10);

  const userPrompt = `Existing areas: ${context.existingAreas.join(", ") || "none"}
Existing projects: ${context.existingProjects.join(", ") || "none"}
Existing contacts: ${context.existingContacts.join(", ") || "none"}

Inbox text:
"""
${text}
"""`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: buildSystemPrompt(today) },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "inbox_extraction",
          strict: true,
          schema: EXTRACTION_SCHEMA,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`AI extraction failed: ${response.status} ${errorBody}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("AI returned an empty response");
  }

  return JSON.parse(content) as InboxExtraction;
}
