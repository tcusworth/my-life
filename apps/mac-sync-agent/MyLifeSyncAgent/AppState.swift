import Foundation
import SwiftUI

@MainActor
final class AppState: ObservableObject {
    private enum Keys {
        static let apiBaseURL = "apiBaseURL"
        static let selectedCalendarIds = "selectedCalendarIds"
        static let writeBackEnabled = "writeBackEnabled"
        static let lastSyncDate = "lastSyncDate"
        static let lastSyncResult = "lastSyncResult"
        static let syncSnapshot = "syncSnapshot"
    }

    @Published var apiBaseURL: String {
        didSet { UserDefaults.standard.set(apiBaseURL, forKey: Keys.apiBaseURL) }
    }

    @Published var apiKeyInput: String = ""
    @Published var hasStoredApiKey: Bool = KeychainStore.loadApiKey() != nil

    @Published var connectionStatus: ConnectionStatus = .disconnected
    @Published var calendarPermission: CalendarPermissionStatus = .unknown
    @Published var availableCalendars: [EventKitCalendarItem] = []
    @Published var selectedCalendarIds: Set<String> {
        didSet {
            UserDefaults.standard.set(Array(selectedCalendarIds), forKey: Keys.selectedCalendarIds)
        }
    }

    @Published var writeBackEnabled: Bool {
        didSet { UserDefaults.standard.set(writeBackEnabled, forKey: Keys.writeBackEnabled) }
    }

    @Published var lastSyncDate: Date? {
        didSet {
            if let lastSyncDate {
                UserDefaults.standard.set(lastSyncDate.timeIntervalSince1970, forKey: Keys.lastSyncDate)
            } else {
                UserDefaults.standard.removeObject(forKey: Keys.lastSyncDate)
            }
        }
    }

    @Published var lastSyncResult: String {
        didSet { UserDefaults.standard.set(lastSyncResult, forKey: Keys.lastSyncResult) }
    }

    @Published var isSyncing = false
    @Published var isTestingConnection = false
    @Published var statusMessage: String?
    private let eventKit = EventKitService()
    private var syncTimer: Timer?

    init() {
        apiBaseURL = UserDefaults.standard.string(forKey: Keys.apiBaseURL) ?? ""
        let storedIds = UserDefaults.standard.stringArray(forKey: Keys.selectedCalendarIds) ?? []
        selectedCalendarIds = Set(storedIds)
        writeBackEnabled = UserDefaults.standard.object(forKey: Keys.writeBackEnabled) as? Bool ?? true
        lastSyncResult = UserDefaults.standard.string(forKey: Keys.lastSyncResult) ?? "Not synced yet"

        if let interval = UserDefaults.standard.object(forKey: Keys.lastSyncDate) as? TimeInterval {
            lastSyncDate = Date(timeIntervalSince1970: interval)
        }

        calendarPermission = eventKit.authorizationStatus()
        refreshConnectionStatus()
    }

    func onAppear() {
        refreshCalendarsIfAuthorized()
        startPeriodicSync()
    }

    func refreshConnectionStatus() {
        guard hasCredentials else {
            connectionStatus = .disconnected
            return
        }
        if connectionStatus == .error {
            return
        }
        connectionStatus = .connected
    }

    var hasCredentials: Bool {
        guard URLValidator.normalizeBaseURL(apiBaseURL) != nil else { return false }
        return hasStoredApiKey || !apiKeyInput.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    func saveCredentials() throws {
        guard let url = URLValidator.normalizeBaseURL(apiBaseURL) else {
            throw SyncError.invalidBaseURL
        }
        apiBaseURL = url.absoluteString

        let trimmedKey = apiKeyInput.trimmingCharacters(in: .whitespacesAndNewlines)
        if !trimmedKey.isEmpty {
            try KeychainStore.saveApiKey(trimmedKey)
            apiKeyInput = ""
            hasStoredApiKey = true
        } else if !hasStoredApiKey {
            throw SyncError.missingCredentials
        }

        connectionStatus = .connected
        statusMessage = "Credentials saved."
    }

    func clearCredentials() {
        KeychainStore.deleteApiKey()
        apiKeyInput = ""
        hasStoredApiKey = false
        apiBaseURL = ""
        connectionStatus = .disconnected
        statusMessage = "Credentials cleared."
    }

    func requestCalendarAccess() async {
        do {
            calendarPermission = try await eventKit.requestAccess()
            if calendarPermission == .authorized {
                refreshCalendarsIfAuthorized()
                statusMessage = "Calendar access granted."
            } else {
                statusMessage = "Calendar access denied. Enable in System Settings → Privacy & Security → Calendars."
            }
        } catch {
            statusMessage = error.localizedDescription
        }
    }

    func refreshCalendarsIfAuthorized() {
        calendarPermission = eventKit.authorizationStatus()
        guard calendarPermission == .authorized else {
            availableCalendars = []
            return
        }

        do {
            availableCalendars = try eventKit.listCalendars()
            let validIds = Set(availableCalendars.map(\.id))
            selectedCalendarIds = selectedCalendarIds.intersection(validIds)
        } catch {
            statusMessage = error.localizedDescription
        }
    }

    func testConnection() async {
        isTestingConnection = true
        defer { isTestingConnection = false }

        do {
            try saveCredentialsIfNeeded()
            let client = try makeClient()
            try await client.testConnection()
            connectionStatus = .connected
            statusMessage = "Connection successful."
        } catch let error as SyncError {
            handleSyncError(error)
        } catch {
            connectionStatus = .error
            statusMessage = error.localizedDescription
        }
    }

    func syncNow() async {
        guard !isSyncing else { return }
        isSyncing = true
        defer { isSyncing = false }

        do {
            try saveCredentialsIfNeeded()
            let client = try makeClient()
            let engine = SyncEngine(client: client, eventKit: eventKit)
            let snapshot = loadSnapshot()

            let (summary, newSnapshot) = try await engine.runSync(
                selectedCalendarIds: selectedCalendarIds,
                writeBackEnabled: writeBackEnabled,
                previousSnapshot: snapshot
            )

            saveSnapshot(newSnapshot)
            lastSyncDate = Date()
            lastSyncResult = formatSummary(summary)
            connectionStatus = .connected
            statusMessage = summary.message
        } catch let error as SyncError {
            handleSyncError(error)
            lastSyncResult = error.localizedDescription ?? "Sync failed"
        } catch {
            connectionStatus = .error
            lastSyncResult = error.localizedDescription
            statusMessage = error.localizedDescription
        }
    }

    private func saveCredentialsIfNeeded() throws {
        let trimmedKey = apiKeyInput.trimmingCharacters(in: .whitespacesAndNewlines)
        if !trimmedKey.isEmpty || !hasStoredApiKey || URLValidator.normalizeBaseURL(apiBaseURL) == nil {
            try saveCredentials()
        }
    }

    private func makeClient() throws -> SyncClient {
        guard let url = URLValidator.normalizeBaseURL(apiBaseURL) else {
            throw SyncError.invalidBaseURL
        }
        guard let apiKey = KeychainStore.loadApiKey() else {
            throw SyncError.missingCredentials
        }
        return SyncClient(baseURL: url, apiKey: apiKey)
    }

    private func handleSyncError(_ error: SyncError) {
        switch error {
        case .unauthorized, .forbidden:
            connectionStatus = .error
        default:
            break
        }
        statusMessage = error.localizedDescription
    }

    private func formatSummary(_ summary: SyncResultSummary) -> String {
        var parts = [
            "\(summary.uploadedEvents) events",
            "\(summary.uploadedSources) calendars",
        ]
        if summary.deletedEvents > 0 {
            parts.append("\(summary.deletedEvents) deletions")
        }
        if summary.pendingCreates > 0 {
            parts.append("\(summary.pendingCreates) write-backs")
        }
        if summary.pendingFailures > 0 {
            parts.append("\(summary.pendingFailures) write failures")
        }
        return parts.joined(separator: ", ")
    }

    private func loadSnapshot() -> SyncSnapshot {
        guard let data = UserDefaults.standard.data(forKey: Keys.syncSnapshot),
              let snapshot = try? JSONDecoder().decode(SyncSnapshot.self, from: data) else {
            return SyncSnapshot(eventsByCalendar: [:])
        }
        return snapshot
    }

    private func saveSnapshot(_ snapshot: SyncSnapshot) {
        if let data = try? JSONEncoder().encode(snapshot) {
            UserDefaults.standard.set(data, forKey: Keys.syncSnapshot)
        }
    }

    private func startPeriodicSync() {
        syncTimer?.invalidate()
        syncTimer = Timer.scheduledTimer(withTimeInterval: 60, repeats: true) { [weak self] _ in
            Task { @MainActor in
                guard let self, self.hasCredentials, self.calendarPermission == .authorized else { return }
                await self.syncNow()
            }
        }
    }
}
