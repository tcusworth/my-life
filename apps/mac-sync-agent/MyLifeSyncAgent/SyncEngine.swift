import Foundation

final class SyncEngine {
    private let client: SyncClient
    private let eventKit: EventKitService

    init(client: SyncClient, eventKit: EventKitService) {
        self.client = client
        self.eventKit = eventKit
    }

    @MainActor
    func runSync(
        selectedCalendarIds: Set<String>,
        writeBackEnabled: Bool,
        previousSnapshot: SyncSnapshot
    ) async throws -> (SyncResultSummary, SyncSnapshot) {
        guard !selectedCalendarIds.isEmpty else {
            throw SyncError.noCalendarsSelected
        }

        let calendars = try eventKit.listCalendars().filter { selectedCalendarIds.contains($0.id) }
        guard !calendars.isEmpty else {
            throw SyncError.noCalendarsSelected
        }

        var pendingCreates = 0
        var pendingFailures = 0

        if writeBackEnabled {
            let pending = try await client.getPendingWrites()
            for write in pending.pendingWrites {
                switch write.operation {
                case "create":
                    do {
                        try await processCreatePendingWrite(write)
                        pendingCreates += 1
                    } catch {
                        pendingFailures += 1
                        let message = (error as? LocalizedError)?.errorDescription ?? error.localizedDescription
                        try? await client.failPendingWrite(id: write.id, errorMessage: message)
                    }
                case "update", "delete":
                    pendingFailures += 1
                    try? await client.failPendingWrite(
                        id: write.id,
                        errorMessage: "Operation '\(write.operation)' is not supported in this agent version."
                    )
                default:
                    pendingFailures += 1
                    try? await client.failPendingWrite(
                        id: write.id,
                        errorMessage: "Unknown operation: \(write.operation)"
                    )
                }
            }
        }

        let sourcePayloads = calendars.map { cal in
            CalendarSourcePayload(
                externalId: cal.id,
                name: cal.title,
                color: cal.colorHex,
                isEnabled: true,
                sourceType: AgentConstants.apiSourceType
            )
        }
        let sourcesResponse = try await client.uploadCalendarSources(sourcePayloads)

        let now = Date()
        let start = Calendar.current.date(byAdding: .day, value: -AgentConstants.daysBack, to: now) ?? now
        let end = Calendar.current.date(byAdding: .day, value: AgentConstants.daysForward, to: now) ?? now

        let localEvents = try eventKit.fetchEvents(calendarIds: selectedCalendarIds, from: start, to: end)
        let eventPayloads = localEvents.map { event in
            EventPayload(
                calendarSourceExternalId: event.calendarExternalId,
                externalId: event.externalId,
                title: event.title,
                description: event.notes,
                location: event.location,
                startsAt: ISO8601.string(from: event.startDate),
                endsAt: ISO8601.string(from: event.endDate),
                isAllDay: event.isAllDay,
                recurrenceRule: nil
            )
        }

        let eventsResponse = try await client.uploadEvents(eventPayloads)

        var newSnapshot = SyncSnapshot(eventsByCalendar: [:])
        for event in localEvents {
            newSnapshot.eventsByCalendar[event.calendarExternalId, default: []].append(event.externalId)
        }

        let deletedPayloads = deletedEvents(
            previous: previousSnapshot,
            current: newSnapshot,
            selectedCalendarIds: selectedCalendarIds
        )
        let deletedResponse = try await client.uploadDeletedEvents(deletedPayloads)

        let summary = SyncResultSummary(
            uploadedSources: sourcesResponse.sources.count,
            uploadedEvents: eventsResponse.events.count,
            deletedEvents: deletedResponse.events.count,
            pendingCreates: pendingCreates,
            pendingFailures: pendingFailures,
            message: "Sync completed successfully."
        )

        return (summary, newSnapshot)
    }

    @MainActor
    private func processCreatePendingWrite(_ write: PendingWrite) async throws {
        let payload = write.payload
        guard let title = payload.title, !title.isEmpty else {
            throw SyncError.serverError("Pending write missing title")
        }
        guard let startsAtString = payload.startsAt, let startsAt = ISO8601.date(from: startsAtString) else {
            throw SyncError.serverError("Pending write missing startsAt")
        }
        guard let endsAtString = payload.endsAt, let endsAt = ISO8601.date(from: endsAtString) else {
            throw SyncError.serverError("Pending write missing endsAt")
        }
        guard let calendarExternalId = payload.calendarSourceExternalId else {
            throw SyncError.serverError("Pending write missing calendarSourceExternalId")
        }

        let externalId = try eventKit.createEvent(
            title: title,
            notes: payload.description,
            location: payload.location,
            startDate: startsAt,
            endDate: endsAt,
            isAllDay: payload.isAllDay ?? false,
            calendarExternalId: calendarExternalId
        )

        _ = try await client.completePendingWrite(id: write.id, externalId: externalId)
    }

    private func deletedEvents(
        previous: SyncSnapshot,
        current: SyncSnapshot,
        selectedCalendarIds: Set<String>
    ) -> [DeletedEventPayload] {
        let deletedAt = ISO8601.string(from: Date())
        var payloads: [DeletedEventPayload] = []

        for calendarId in selectedCalendarIds {
            let previousIds = Set(previous.eventsByCalendar[calendarId] ?? [])
            let currentIds = Set(current.eventsByCalendar[calendarId] ?? [])
            let removed = previousIds.subtracting(currentIds)

            for externalId in removed {
                payloads.append(
                    DeletedEventPayload(
                        calendarSourceExternalId: calendarId,
                        externalId: externalId,
                        deletedAt: deletedAt
                    )
                )
            }
        }

        return payloads
    }
}
