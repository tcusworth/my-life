import Foundation

enum AgentConstants {
    static let agentVersion = "1.0.0"
    /// API accepts `eventkit` for Apple Calendar data read via EventKit.
    static let apiSourceType = "eventkit"
    static let myLifeEventNote = "Created by MyLife"
    static let daysBack = 30
    static let daysForward = 180
}

// MARK: - API payloads

struct CalendarSourcePayload: Codable {
    let externalId: String
    let name: String
    let color: String?
    let isEnabled: Bool
    let sourceType: String
}

struct CalendarSourcesRequest: Codable {
    let sources: [CalendarSourcePayload]
}

struct CalendarSourcesResponse: Codable {
    let sources: [CalendarSourceResult]
}

struct CalendarSourceResult: Codable {
    let externalId: String
    let id: String
    let action: String
}

struct EventPayload: Codable {
    let calendarSourceExternalId: String
    let externalId: String
    let title: String
    let description: String?
    let location: String?
    let startsAt: String
    let endsAt: String
    let isAllDay: Bool
    let recurrenceRule: String?
}

struct EventsRequest: Codable {
    let events: [EventPayload]
}

struct EventsResponse: Codable {
    let events: [EventUploadResult]
}

struct EventUploadResult: Codable {
    let externalId: String
    let id: String
    let action: String
}

struct DeletedEventPayload: Codable {
    let calendarSourceExternalId: String
    let externalId: String
    let deletedAt: String
}

struct DeletedEventsRequest: Codable {
    let events: [DeletedEventPayload]
}

struct DeletedEventsResponse: Codable {
    let events: [DeletedEventResult]
}

struct DeletedEventResult: Codable {
    let externalId: String
    let id: String?
    let deleted: Bool
}

struct PendingWritesResponse: Codable {
    let pendingWrites: [PendingWrite]
}

struct PendingWrite: Codable, Identifiable {
    let id: String
    let operation: String
    let status: String
    let payload: PendingWritePayload
    let created: String?
    let updated: String?
}

struct PendingWritePayload: Codable {
    let title: String?
    let description: String?
    let location: String?
    let startsAt: String?
    let endsAt: String?
    let isAllDay: Bool?
    let calendarSourceExternalId: String?
    let externalId: String?
}

struct PendingWriteCompleteRequest: Codable {
    let externalId: String
    let calendarEventId: String?
}

struct PendingWriteCompleteResponse: Codable {
    let pendingWriteId: String
    let status: String
    let calendarEventId: String?
    let externalId: String
}

struct PendingWriteFailRequest: Codable {
    let errorMessage: String
}

struct PendingWriteFailResponse: Codable {
    let pendingWriteId: String
    let status: String
    let errorMessage: String?
}

struct APIErrorResponse: Codable {
    let error: String?
    let code: String?
}

// MARK: - Local models

struct SyncSnapshot: Codable {
    var eventsByCalendar: [String: [String]]
}

enum ConnectionStatus: String {
    case disconnected
    case connected
    case error
}

enum CalendarPermissionStatus: String {
    case unknown
    case denied
    case authorized
    case restricted
}

struct SyncResultSummary: Equatable {
    let uploadedSources: Int
    let uploadedEvents: Int
    let deletedEvents: Int
    let pendingCreates: Int
    let pendingFailures: Int
    let message: String
}

enum SyncError: LocalizedError {
    case missingCredentials
    case invalidBaseURL
    case unauthorized
    case forbidden
    case serverError(String)
    case networkError(String)
    case calendarAccessDenied
    case noCalendarsSelected

    var errorDescription: String? {
        switch self {
        case .missingCredentials: return "API base URL and key are required."
        case .invalidBaseURL: return "API base URL is invalid."
        case .unauthorized: return "API key was rejected (401). Re-register in the web app."
        case .forbidden: return "Access forbidden (403)."
        case .serverError(let msg): return msg
        case .networkError(let msg): return msg
        case .calendarAccessDenied: return "Calendar access was denied."
        case .noCalendarsSelected: return "Select at least one calendar to sync."
        }
    }
}
