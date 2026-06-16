import SwiftUI
import AppKit

struct MenuBarView: View {
    @Environment(\.openWindow) private var openWindow
    @EnvironmentObject private var appState: AppState

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("MyLife Sync Agent")
                .font(.headline)

            statusRow("Connection", value: appState.connectionStatus.rawValue.capitalized)
            statusRow("Calendar", value: appState.calendarPermission.rawValue.capitalized)

            if let lastSync = appState.lastSyncDate {
                statusRow("Last sync", value: lastSync.formatted(date: .abbreviated, time: .shortened))
            } else {
                statusRow("Last sync", value: "Never")
            }

            statusRow("Result", value: appState.lastSyncResult)

            if appState.isSyncing {
                ProgressView("Syncing…")
                    .controlSize(.small)
            }

            Divider()

            Button("Open Settings") {
                openWindow(id: "settings")
                NSApp.activate(ignoringOtherApps: true)
            }

            Button("Sync Now") {
                Task { await appState.syncNow() }
            }
            .disabled(appState.isSyncing || !appState.hasCredentials)

            Divider()

            Button("Quit") {
                NSApplication.shared.terminate(nil)
            }
        }
        .padding(12)
        .frame(width: 280)
    }

    private func statusRow(_ label: String, value: String) -> some View {
        HStack(alignment: .top) {
            Text(label)
                .foregroundStyle(.secondary)
                .frame(width: 80, alignment: .leading)
            Text(value)
                .lineLimit(3)
                .multilineTextAlignment(.leading)
            Spacer(minLength: 0)
        }
        .font(.caption)
    }
}
