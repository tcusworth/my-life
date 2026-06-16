import SwiftUI

@main
struct MyLifeSyncAgentApp: App {
    @StateObject private var appState = AppState()

    var body: some Scene {
        MenuBarExtra("MyLife Sync Agent", systemImage: "calendar.badge.clock") {
            MenuBarView()
                .environmentObject(appState)
                .onAppear { appState.onAppear() }
        }
        .menuBarExtraStyle(.window)

        Window("MyLife Sync Agent Settings", id: "settings") {
            SettingsView()
                .environmentObject(appState)
        }
        .defaultSize(width: 520, height: 560)
    }
}
