import Foundation
import TraceletSDK

/// Forwards Tracelet engine events to the Expo Module's `sendEvent`.
///
/// Tracelet's engine threads call into this from any thread; Expo's bridge
/// handles thread-safe dispatch into the JS runtime, so we don't marshal here.
final class RNTraceletEventSender: TraceletEventSending {

    private let emit: (String, [String: Any]) -> Void

    init(emit: @escaping (String, [String: Any]) -> Void) {
        self.emit = emit
    }

    func sendLocation(_ data: [String: Any]) { emit("onLocation", data) }
    func sendMotionChange(_ data: [String: Any]) { emit("onMotionChange", data) }
    func sendActivityChange(_ data: [String: Any]) { emit("onActivityChange", data) }
    func sendProviderChange(_ data: [String: Any]) { emit("onProviderChange", data) }
    func sendGeofence(_ data: [String: Any]) { emit("onGeofence", data) }
    func sendGeofencesChange(_ data: [String: Any]) { emit("onGeofencesChange", data) }
    func sendHeartbeat(_ data: [String: Any]) { emit("onHeartbeat", data) }
    func sendHttp(_ data: [String: Any]) { emit("onHttp", data) }
    func sendSchedule(_ data: [String: Any]) { emit("onSchedule", data) }

    func sendPowerSaveChange(_ isPowerSave: Bool) {
        emit("onPowerSaveChange", ["isPowerSaveMode": isPowerSave])
    }

    func sendConnectivityChange(_ data: [String: Any]) { emit("onConnectivityChange", data) }

    func sendEnabledChange(_ enabled: Bool) {
        emit("onEnabledChange", ["enabled": enabled])
    }

    func sendNotificationAction(_ data: [String: Any]) { emit("onNotificationAction", data) }
    func sendAuthorization(_ data: [String: Any]) { emit("onAuthorization", data) }
    func sendWatchPosition(_ data: [String: Any]) { emit("onWatchPosition", data) }
    func sendRemoteConfigEvent(_ data: [String: Any]) { emit("onRemoteConfig", data) }
    func sendTrip(_ data: [String: Any]) { emit("onTrip", data) }
    func sendBudgetAdjustment(_ data: [String: Any]) { emit("onBudgetAdjustment", data) }

    // Expo's bridge does not expose listener counts; the JS side is always
    // reachable while the module is loaded, so dispatch unconditionally.
    func hasListener(eventName: String) -> Bool { true }
}
