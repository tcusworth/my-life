export type SyncValidationIssue = {
  path: string;
  message: string;
};

export type SyncValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; issues: SyncValidationIssue[] };

function issues(result: SyncValidationResult<unknown>): SyncValidationIssue[] {
  return result.ok ? [] : result.issues;
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false;
  return !Number.isNaN(Date.parse(value));
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export interface CalendarSourcePayload {
  externalId: string;
  name: string;
  color?: string;
  isEnabled?: boolean;
  sourceType?: "eventkit" | "internal";
}

export interface CalendarSourcesUploadPayload {
  sources: CalendarSourcePayload[];
}

export function validateCalendarSourcesPayload(
  body: unknown
): SyncValidationResult<CalendarSourcesUploadPayload> {
  const errors: SyncValidationIssue[] = [];

  if (!body || typeof body !== "object") {
    return { ok: false, issues: [{ path: "$", message: "Body must be an object" }] };
  }

  const sources = (body as { sources?: unknown }).sources;
  if (!Array.isArray(sources)) {
    return {
      ok: false,
      issues: [{ path: "sources", message: "sources must be an array" }],
    };
  }

  const parsed: CalendarSourcePayload[] = [];

  sources.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      errors.push({ path: `sources[${index}]`, message: "must be an object" });
      return;
    }

    const record = item as Record<string, unknown>;
    if (!isNonEmptyString(record.externalId)) {
      errors.push({
        path: `sources[${index}].externalId`,
        message: "externalId is required",
      });
    }
    if (!isNonEmptyString(record.name)) {
      errors.push({ path: `sources[${index}].name`, message: "name is required" });
    }
    if (
      record.sourceType != null &&
      record.sourceType !== "eventkit" &&
      record.sourceType !== "internal"
    ) {
      errors.push({
        path: `sources[${index}].sourceType`,
        message: "sourceType must be eventkit or internal",
      });
    }

    if (isNonEmptyString(record.externalId) && isNonEmptyString(record.name)) {
      parsed.push({
        externalId: record.externalId.trim(),
        name: record.name.trim(),
        color: typeof record.color === "string" ? record.color : undefined,
        isEnabled:
          typeof record.isEnabled === "boolean" ? record.isEnabled : undefined,
        sourceType:
          record.sourceType === "internal" ? "internal" : "eventkit",
      });
    }
  });

  if (errors.length) return { ok: false, issues: errors };
  return { ok: true, data: { sources: parsed } };
}

export interface EventPayload {
  calendarSourceExternalId: string;
  externalId: string;
  title: string;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt: string;
  isAllDay?: boolean;
  recurrenceRule?: string;
}

export interface EventsUploadPayload {
  events: EventPayload[];
}

export function validateEventsPayload(
  body: unknown
): SyncValidationResult<EventsUploadPayload> {
  const errors: SyncValidationIssue[] = [];

  if (!body || typeof body !== "object") {
    return { ok: false, issues: [{ path: "$", message: "Body must be an object" }] };
  }

  const events = (body as { events?: unknown }).events;
  if (!Array.isArray(events)) {
    return { ok: false, issues: [{ path: "events", message: "events must be an array" }] };
  }

  const parsed: EventPayload[] = [];

  events.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      errors.push({ path: `events[${index}]`, message: "must be an object" });
      return;
    }

    const record = item as Record<string, unknown>;
    const requiredStrings = [
      ["calendarSourceExternalId", record.calendarSourceExternalId],
      ["externalId", record.externalId],
      ["title", record.title],
    ] as const;

    for (const [field, value] of requiredStrings) {
      if (!isNonEmptyString(value)) {
        errors.push({
          path: `events[${index}].${field}`,
          message: `${field} is required`,
        });
      }
    }

    if (!isIsoDate(record.startsAt)) {
      errors.push({
        path: `events[${index}].startsAt`,
        message: "startsAt must be ISO 8601",
      });
    }
    if (!isIsoDate(record.endsAt)) {
      errors.push({
        path: `events[${index}].endsAt`,
        message: "endsAt must be ISO 8601",
      });
    }

    if (
      isNonEmptyString(record.calendarSourceExternalId) &&
      isNonEmptyString(record.externalId) &&
      isNonEmptyString(record.title) &&
      isIsoDate(record.startsAt) &&
      isIsoDate(record.endsAt)
    ) {
      parsed.push({
        calendarSourceExternalId: record.calendarSourceExternalId.trim(),
        externalId: record.externalId.trim(),
        title: record.title.trim(),
        description:
          typeof record.description === "string" ? record.description : undefined,
        location: typeof record.location === "string" ? record.location : undefined,
        startsAt: new Date(record.startsAt).toISOString(),
        endsAt: new Date(record.endsAt).toISOString(),
        isAllDay: typeof record.isAllDay === "boolean" ? record.isAllDay : undefined,
        recurrenceRule:
          typeof record.recurrenceRule === "string"
            ? record.recurrenceRule
            : undefined,
      });
    }
  });

  if (errors.length) return { ok: false, issues: errors };
  return { ok: true, data: { events: parsed } };
}

export interface DeletedEventPayload {
  calendarSourceExternalId: string;
  externalId: string;
  deletedAt?: string;
}

export interface DeletedEventsPayload {
  events: DeletedEventPayload[];
}

export function validateDeletedEventsPayload(
  body: unknown
): SyncValidationResult<DeletedEventsPayload> {
  const errors: SyncValidationIssue[] = [];

  if (!body || typeof body !== "object") {
    return { ok: false, issues: [{ path: "$", message: "Body must be an object" }] };
  }

  const events = (body as { events?: unknown }).events;
  if (!Array.isArray(events)) {
    return { ok: false, issues: [{ path: "events", message: "events must be an array" }] };
  }

  const parsed: DeletedEventPayload[] = [];

  events.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      errors.push({ path: `events[${index}]`, message: "must be an object" });
      return;
    }

    const record = item as Record<string, unknown>;
    if (!isNonEmptyString(record.calendarSourceExternalId)) {
      errors.push({
        path: `events[${index}].calendarSourceExternalId`,
        message: "calendarSourceExternalId is required",
      });
    }
    if (!isNonEmptyString(record.externalId)) {
      errors.push({
        path: `events[${index}].externalId`,
        message: "externalId is required",
      });
    }
    if (record.deletedAt != null && !isIsoDate(record.deletedAt)) {
      errors.push({
        path: `events[${index}].deletedAt`,
        message: "deletedAt must be ISO 8601",
      });
    }

    if (
      isNonEmptyString(record.calendarSourceExternalId) &&
      isNonEmptyString(record.externalId)
    ) {
      parsed.push({
        calendarSourceExternalId: record.calendarSourceExternalId.trim(),
        externalId: record.externalId.trim(),
        deletedAt: isIsoDate(record.deletedAt)
          ? new Date(record.deletedAt).toISOString()
          : undefined,
      });
    }
  });

  if (errors.length) return { ok: false, issues: errors };
  return { ok: true, data: { events: parsed } };
}

export interface PendingWriteCompletePayload {
  externalId: string;
  calendarEventId?: string;
}

export function validatePendingWriteCompletePayload(
  body: unknown
): SyncValidationResult<PendingWriteCompletePayload> {
  if (!body || typeof body !== "object") {
    return { ok: false, issues: [{ path: "$", message: "Body must be an object" }] };
  }

  const record = body as Record<string, unknown>;
  if (!isNonEmptyString(record.externalId)) {
    return {
      ok: false,
      issues: [{ path: "externalId", message: "externalId is required" }],
    };
  }

  if (
    record.calendarEventId != null &&
    typeof record.calendarEventId !== "string"
  ) {
    return {
      ok: false,
      issues: [{ path: "calendarEventId", message: "calendarEventId must be a string" }],
    };
  }

  return {
    ok: true,
    data: {
      externalId: record.externalId.trim(),
      calendarEventId:
        typeof record.calendarEventId === "string"
          ? record.calendarEventId.trim()
          : undefined,
    },
  };
}

export interface PendingWriteFailPayload {
  errorMessage: string;
}

export function validatePendingWriteFailPayload(
  body: unknown
): SyncValidationResult<PendingWriteFailPayload> {
  if (!body || typeof body !== "object") {
    return { ok: false, issues: [{ path: "$", message: "Body must be an object" }] };
  }

  const record = body as Record<string, unknown>;
  if (!isNonEmptyString(record.errorMessage)) {
    return {
      ok: false,
      issues: [{ path: "errorMessage", message: "errorMessage is required" }],
    };
  }

  return {
    ok: true,
    data: { errorMessage: record.errorMessage.trim() },
  };
}

export function validatePendingWriteStatus(status: string) {
  return ["pending", "processing", "completed", "failed"].includes(status);
}

export function formatValidationIssues(issues: SyncValidationIssue[]) {
  return issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
}
