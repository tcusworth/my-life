import Foundation

final class SyncClient {
    private let baseURL: URL
    private let apiKey: String
    private let session: URLSession
    private let encoder: JSONEncoder
    private let decoder: JSONDecoder

    init(baseURL: URL, apiKey: String, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.apiKey = apiKey
        self.session = session
        self.encoder = JSONEncoder()
        self.decoder = JSONDecoder()
    }

    func testConnection() async throws {
        _ = try await getPendingWrites()
    }

    func uploadCalendarSources(_ sources: [CalendarSourcePayload]) async throws -> CalendarSourcesResponse {
        try await post("/api/sync/calendars", body: CalendarSourcesRequest(sources: sources))
    }

    func uploadEvents(_ events: [EventPayload]) async throws -> EventsResponse {
        try await post("/api/sync/events", body: EventsRequest(events: events))
    }

    func uploadDeletedEvents(_ events: [DeletedEventPayload]) async throws -> DeletedEventsResponse {
        try await post("/api/sync/events/deleted", body: DeletedEventsRequest(events: events))
    }

    func getPendingWrites() async throws -> PendingWritesResponse {
        try await get("/api/sync/pending-writes")
    }

    func completePendingWrite(id: String, externalId: String, calendarEventId: String? = nil) async throws -> PendingWriteCompleteResponse {
        try await post(
            "/api/sync/pending-writes/\(id)/complete",
            body: PendingWriteCompleteRequest(externalId: externalId, calendarEventId: calendarEventId)
        )
    }

    func failPendingWrite(id: String, errorMessage: String) async throws -> PendingWriteFailResponse {
        try await post(
            "/api/sync/pending-writes/\(id)/fail",
            body: PendingWriteFailRequest(errorMessage: errorMessage)
        )
    }

    // MARK: - HTTP

    private func get<T: Decodable>(_ path: String) async throws -> T {
        let request = try makeRequest(path: path, method: "GET")
        let (data, response) = try await session.data(for: request)
        return try decodeResponse(data: data, response: response)
    }

    private func post<T: Decodable, B: Encodable>(_ path: String, body: B) async throws -> T {
        var request = try makeRequest(path: path, method: "POST")
        request.httpBody = try encoder.encode(body)
        let (data, response) = try await session.data(for: request)
        return try decodeResponse(data: data, response: response)
    }

    private func makeRequest(path: String, method: String) throws -> URLRequest {
        guard let url = URL(string: path, relativeTo: baseURL) else {
            throw SyncError.invalidBaseURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.setValue(AgentConstants.agentVersion, forHTTPHeaderField: "X-Sync-Agent-Version")
        return request
    }

    private func decodeResponse<T: Decodable>(data: Data, response: URLResponse) throws -> T {
        guard let http = response as? HTTPURLResponse else {
            throw SyncError.networkError("Invalid response")
        }

        switch http.statusCode {
        case 200...299:
            do {
                return try decoder.decode(T.self, from: data)
            } catch {
                throw SyncError.serverError("Unexpected response format")
            }
        case 401:
            throw SyncError.unauthorized
        case 403:
            throw SyncError.forbidden
        default:
            if let apiError = try? decoder.decode(APIErrorResponse.self, from: data),
               let message = apiError.error {
                throw SyncError.serverError(message)
            }
            let body = String(data: data, encoding: .utf8) ?? "HTTP \(http.statusCode)"
            throw SyncError.serverError(body)
        }
    }
}

enum URLValidator {
    static func normalizeBaseURL(_ string: String) -> URL? {
        var trimmed = string.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmed.hasSuffix("/") {
            trimmed.removeLast()
        }
        guard !trimmed.isEmpty, let url = URL(string: trimmed), url.scheme?.hasPrefix("http") == true else {
            return nil
        }
        return url
    }
}

enum ISO8601 {
    static let formatter: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f
    }()

    static let fallback: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime]
        return f
    }()

    static func string(from date: Date) -> String {
        formatter.string(from: date)
    }

    static func date(from string: String) -> Date? {
        formatter.date(from: string) ?? fallback.date(from: string)
    }
}
