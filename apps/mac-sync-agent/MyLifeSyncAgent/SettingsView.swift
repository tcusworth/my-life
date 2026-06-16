import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var appState: AppState

    var body: some View {
        Form {
            Section("Connection") {
                TextField("API base URL", text: $appState.apiBaseURL, prompt: Text("https://my-life.example.com"))
                    .textFieldStyle(.roundedBorder)

                SecureField(
                    appState.hasStoredApiKey ? "API key (stored in Keychain — enter to replace)" : "API key",
                    text: $appState.apiKeyInput
                )
                .textFieldStyle(.roundedBorder)

                HStack {
                    Button("Save Credentials") {
                        do {
                            try appState.saveCredentials()
                        } catch {
                            appState.statusMessage = error.localizedDescription
                        }
                    }

                    Button("Test Connection") {
                        Task { await appState.testConnection() }
                    }
                    .disabled(appState.isTestingConnection)

                    if appState.isTestingConnection {
                        ProgressView()
                            .controlSize(.small)
                    }
                }

                Button("Clear Credentials", role: .destructive) {
                    appState.clearCredentials()
                }
            }

            Section("Apple Calendar") {
                HStack {
                    Text("Permission")
                    Spacer()
                    Text(appState.calendarPermission.rawValue.capitalized)
                        .foregroundStyle(.secondary)
                }

                Button("Request Calendar Access") {
                    Task { await appState.requestCalendarAccess() }
                }

                if appState.calendarPermission == .authorized {
                    if appState.availableCalendars.isEmpty {
                        Text("No calendars found.")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(appState.availableCalendars) { calendar in
                            Toggle(isOn: binding(for: calendar.id)) {
                                HStack {
                                    if let hex = calendar.colorHex, let color = Color(hex: hex) {
                                        Circle()
                                            .fill(color)
                                            .frame(width: 10, height: 10)
                                    }
                                    Text(calendar.title)
                                    if !calendar.allowsContentModifications {
                                        Text("(read-only)")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            Section("Sync") {
                Toggle("Write-back enabled", isOn: $appState.writeBackEnabled)
                    .help("When enabled, pending writes from My Life are created as new Apple Calendar events.")

                Button("Sync Now") {
                    Task { await appState.syncNow() }
                }
                .disabled(appState.isSyncing || !appState.hasCredentials)

                if appState.isSyncing {
                    ProgressView("Syncing…")
                }

                if let message = appState.statusMessage {
                    Text(message)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .formStyle(.grouped)
        .frame(minWidth: 480, minHeight: 520)
        .padding()
        .onAppear {
            appState.refreshCalendarsIfAuthorized()
        }
    }

    private func binding(for calendarId: String) -> Binding<Bool> {
        Binding(
            get: { appState.selectedCalendarIds.contains(calendarId) },
            set: { isSelected in
                if isSelected {
                    appState.selectedCalendarIds.insert(calendarId)
                } else {
                    appState.selectedCalendarIds.remove(calendarId)
                }
            }
        )
    }
}

private extension Color {
    init?(hex: String) {
        var hexSanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        if hexSanitized.hasPrefix("#") {
            hexSanitized.removeFirst()
        }
        guard hexSanitized.count == 6, let int = UInt64(hexSanitized, radix: 16) else {
            return nil
        }
        let r = Double((int >> 16) & 0xFF) / 255
        let g = Double((int >> 8) & 0xFF) / 255
        let b = Double(int & 0xFF) / 255
        self.init(red: r, green: g, blue: b)
    }
}
