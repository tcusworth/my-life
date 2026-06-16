import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  validateCalendarSourcesPayload,
  validateDeletedEventsPayload,
  validateEventsPayload,
  validatePendingWriteCompletePayload,
  validatePendingWriteFailPayload,
  validatePendingWriteStatus,
} from "./validation.ts";

describe("validateCalendarSourcesPayload", () => {
  it("accepts valid sources", () => {
    const result = validateCalendarSourcesPayload({
      sources: [
        {
          externalId: "EK:cal-1",
          name: "Work",
          sourceType: "eventkit",
        },
      ],
    });
    assert.equal(result.ok, true);
  });

  it("rejects missing externalId", () => {
    const result = validateCalendarSourcesPayload({
      sources: [{ name: "Work" }],
    });
    assert.equal(result.ok, false);
  });
});

describe("validateEventsPayload", () => {
  it("accepts valid events", () => {
    const result = validateEventsPayload({
      events: [
        {
          calendarSourceExternalId: "EK:cal-1",
          externalId: "EK:evt-1",
          title: "Standup",
          startsAt: "2026-06-16T09:00:00.000Z",
          endsAt: "2026-06-16T09:30:00.000Z",
        },
      ],
    });
    assert.equal(result.ok, true);
  });

  it("rejects invalid dates", () => {
    const result = validateEventsPayload({
      events: [
        {
          calendarSourceExternalId: "EK:cal-1",
          externalId: "EK:evt-1",
          title: "Standup",
          startsAt: "not-a-date",
          endsAt: "2026-06-16T09:30:00.000Z",
        },
      ],
    });
    assert.equal(result.ok, false);
  });
});

describe("validateDeletedEventsPayload", () => {
  it("accepts deleted events", () => {
    const result = validateDeletedEventsPayload({
      events: [
        {
          calendarSourceExternalId: "EK:cal-1",
          externalId: "EK:evt-1",
        },
      ],
    });
    assert.equal(result.ok, true);
  });
});

describe("validatePendingWriteCompletePayload", () => {
  it("requires externalId", () => {
    const result = validatePendingWriteCompletePayload({});
    assert.equal(result.ok, false);
  });
});

describe("validatePendingWriteFailPayload", () => {
  it("requires errorMessage", () => {
    const result = validatePendingWriteFailPayload({});
    assert.equal(result.ok, false);
  });
});

describe("validatePendingWriteStatus", () => {
  it("accepts known statuses", () => {
    assert.equal(validatePendingWriteStatus("pending"), true);
    assert.equal(validatePendingWriteStatus("completed"), true);
    assert.equal(validatePendingWriteStatus("unknown"), false);
  });
});
