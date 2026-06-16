import EventKit
import AppKit

struct EventKitCalendarItem: Identifiable, Hashable {
    let id: String
    let title: String
    let colorHex: String?
    let allowsContentModifications: Bool
}

struct EventKitEventItem {
    let calendarExternalId: String
    let externalId: String
    let title: String
    let notes: String?
    let location: String?
    let startDate: Date
    let endDate: Date
    let isAllDay: Bool
}

@MainActor
final class EventKitService {
    private let store = EKEventStore()

    func authorizationStatus() -> CalendarPermissionStatus {
        switch EKEventStore.authorizationStatus(for: .event) {
        case .notDetermined: return .unknown
        case .restricted: return .restricted
        case .denied: return .denied
        case .fullAccess, .writeOnly, .authorized: return .authorized
        @unknown default: return .unknown
        }
    }

    func requestAccess() async throws -> CalendarPermissionStatus {
        if #available(macOS 14.0, *) {
            let granted = try await store.requestFullAccessToEvents()
            return granted ? .authorized : .denied
        } else {
            return try await withCheckedThrowingContinuation { continuation in
                store.requestAccess(to: .event) { granted, error in
                    if let error {
                        continuation.resume(throwing: error)
                        return
                    }
                    continuation.resume(returning: granted ? .authorized : .denied)
                }
            }
        }
    }

    func listCalendars() throws -> [EventKitCalendarItem] {
        store.calendars(for: .event).map { calendar in
            EventKitCalendarItem(
                id: calendar.calendarIdentifier,
                title: calendar.title,
                colorHex: calendar.cgColor?.hexString,
                allowsContentModifications: calendar.allowsContentModifications
            )
        }
        .sorted { $0.title.localizedCaseInsensitiveCompare($1.title) == .orderedAscending }
    }

    func fetchEvents(calendarIds: Set<String>, from start: Date, to end: Date) throws -> [EventKitEventItem] {
        let calendars = store.calendars(for: .event).filter { calendarIds.contains($0.calendarIdentifier) }
        guard !calendars.isEmpty else { return [] }

        let predicate = store.predicateForEvents(withStart: start, end: end, calendars: calendars)
        let events = store.events(matching: predicate)

        return events.compactMap { event in
            guard let externalId = event.eventIdentifier else { return nil }
            return EventKitEventItem(
                calendarExternalId: event.calendar.calendarIdentifier,
                externalId: externalId,
                title: event.title ?? "Untitled",
                notes: event.notes,
                location: event.location,
                startDate: event.startDate,
                endDate: event.endDate,
                isAllDay: event.isAllDay
            )
        }
    }

    /// Creates a new Apple Calendar event for a pending write. Does not modify existing events.
    func createEvent(
        title: String,
        notes: String?,
        location: String?,
        startDate: Date,
        endDate: Date,
        isAllDay: Bool,
        calendarExternalId: String
    ) throws -> String {
        guard let calendar = store.calendars(for: .event).first(where: { $0.calendarIdentifier == calendarExternalId }) else {
            throw SyncError.serverError("Calendar not found locally: \(calendarExternalId)")
        }

        guard calendar.allowsContentModifications else {
            throw SyncError.serverError("Calendar is read-only: \(calendar.title)")
        }

        let event = EKEvent(eventStore: store)
        event.calendar = calendar
        event.title = title
        event.location = location
        event.startDate = startDate
        event.endDate = endDate
        event.isAllDay = isAllDay

        var combinedNotes = AgentConstants.myLifeEventNote
        if let notes, !notes.isEmpty {
            combinedNotes += "\n\n\(notes)"
        }
        event.notes = combinedNotes

        try store.save(event, span: .thisEvent, commit: true)

        guard let externalId = event.eventIdentifier else {
            throw SyncError.serverError("EventKit did not return an event identifier")
        }
        return externalId
    }
}

private extension CGColor {
    var hexString: String? {
        guard let rgb = converted(to: CGColorSpace(name: CGColorSpace.sRGB)!, intent: .defaultIntent, options: nil),
              let components = rgb.components, components.count >= 3 else {
            return nil
        }
        let r = Int(components[0] * 255)
        let g = Int(components[1] * 255)
        let b = Int(components[2] * 255)
        return String(format: "#%02X%02X%02X", r, g, b)
    }
}
