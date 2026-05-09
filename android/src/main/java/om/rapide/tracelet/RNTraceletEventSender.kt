package om.rapide.tracelet

import com.ikolvi.tracelet.sdk.TraceletEventSender

/**
 * Forwards Tracelet engine events to the Expo Module's `sendEvent`.
 *
 * Tracelet's engine threads call into this from any thread; Expo's bridge
 * handles thread-safe dispatch into the JS runtime, so we don't need to
 * marshal here.
 */
internal class RNTraceletEventSender(
    private val emit: (eventName: String, data: Map<String, Any?>) -> Unit,
) : TraceletEventSender {

    override fun sendLocation(data: Map<String, Any?>) =
        emit("onLocation", data)

    override fun sendMotionChange(data: Map<String, Any?>) =
        emit("onMotionChange", data)

    override fun sendActivityChange(data: Map<String, Any?>) =
        emit("onActivityChange", data)

    override fun sendProviderChange(data: Map<String, Any?>) =
        emit("onProviderChange", data)

    override fun sendGeofence(data: Map<String, Any?>) =
        emit("onGeofence", data)

    override fun sendGeofencesChange(data: Map<String, Any?>) =
        emit("onGeofencesChange", data)

    override fun sendHeartbeat(data: Map<String, Any?>) =
        emit("onHeartbeat", data)

    override fun sendHttp(data: Map<String, Any?>) =
        emit("onHttp", data)

    override fun sendSchedule(data: Map<String, Any?>) =
        emit("onSchedule", data)

    override fun sendPowerSaveChange(isPowerSaveMode: Boolean) =
        emit("onPowerSaveChange", mapOf("isPowerSaveMode" to isPowerSaveMode))

    override fun sendConnectivityChange(data: Map<String, Any?>) =
        emit("onConnectivityChange", data)

    override fun sendEnabledChange(enabled: Boolean) =
        emit("onEnabledChange", mapOf("enabled" to enabled))

    override fun sendNotificationAction(action: String) =
        emit("onNotificationAction", mapOf("action" to action))

    override fun sendAuthorization(data: Map<String, Any?>) =
        emit("onAuthorization", data)

    override fun sendWatchPosition(data: Map<String, Any?>) =
        emit("onWatchPosition", data)

    override fun sendRemoteConfigEvent(data: Map<String, Any?>) =
        emit("onRemoteConfig", data)

    override fun sendTrip(data: Map<String, Any?>) =
        emit("onTrip", data)

    override fun sendBudgetAdjustment(data: Map<String, Any?>) =
        emit("onBudgetAdjustment", data)

    // Expo's bridge does not expose listener counts; the JS side is always
    // reachable while the module is loaded, so dispatch unconditionally.
    override fun hasListener(eventName: String): Boolean = true
}
