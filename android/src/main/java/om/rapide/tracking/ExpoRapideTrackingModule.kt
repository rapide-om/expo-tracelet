package om.rapide.tracking

import com.ikolvi.tracelet.sdk.TraceletSdk
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoRapideTrackingModule : Module() {

    private val sdk: TraceletSdk by lazy {
        TraceletSdk.getInstance(appContext.reactContext!!.applicationContext)
    }

    override fun definition() = ModuleDefinition {
        Name("ExpoRapideTracking")

        Events(
            "onLocation",
            "onMotionChange",
            "onActivityChange",
            "onProviderChange",
            "onGeofence",
            "onGeofencesChange",
            "onHeartbeat",
            "onHttp",
            "onSchedule",
            "onPowerSaveChange",
            "onConnectivityChange",
            "onEnabledChange",
            "onNotificationAction",
            "onAuthorization",
            "onWatchPosition",
            "onRemoteConfig",
            "onTrip",
            "onBudgetAdjustment",
        )

        // ---------------------------------------------------------------
        // Lifecycle
        // ---------------------------------------------------------------

        AsyncFunction("ready") { config: Map<String, Any?>, promise: expo.modules.kotlin.Promise ->
            sdk.setEventSender(RNTraceletEventSender { eventName, data ->
                this@ExpoRapideTrackingModule.sendEvent(eventName, data)
            })
            sdk.ready(config) { state -> promise.resolve(state) }
        }

        AsyncFunction("start") {
            sdk.start()
        }

        AsyncFunction("stop") {
            sdk.stop()
        }

        AsyncFunction("startGeofences") {
            sdk.startGeofences()
        }

        AsyncFunction("startPeriodic") {
            sdk.startPeriodic()
        }

        AsyncFunction("getState") {
            sdk.getState()
        }

        AsyncFunction("setConfig") { config: Map<String, Any?> ->
            sdk.setConfig(config)
        }

        AsyncFunction("reset") { config: Map<String, Any?>? ->
            sdk.reset(config)
        }

        // ---------------------------------------------------------------
        // Location
        // ---------------------------------------------------------------

        AsyncFunction("getCurrentPosition") { options: Map<String, Any?>, promise: expo.modules.kotlin.Promise ->
            sdk.getCurrentPosition(options) { result -> promise.resolve(result) }
        }

        AsyncFunction("getLastKnownLocation") { options: Map<String, Any?>, promise: expo.modules.kotlin.Promise ->
            sdk.getLastKnownLocation(options) { result -> promise.resolve(result) }
        }

        AsyncFunction("watchPosition") { options: Map<String, Any?> ->
            sdk.watchPosition(options)
        }

        AsyncFunction("stopWatchPosition") { watchId: Int ->
            sdk.stopWatchPosition(watchId)
        }

        AsyncFunction("changePace") { isMoving: Boolean ->
            sdk.changePace(isMoving)
        }

        AsyncFunction("getOdometer") {
            sdk.getOdometer()
        }

        AsyncFunction("setOdometer") { value: Double ->
            sdk.setOdometer(value)
        }

        // ---------------------------------------------------------------
        // HTTP sync
        // ---------------------------------------------------------------

        AsyncFunction("sync") { promise: expo.modules.kotlin.Promise ->
            sdk.sync { result -> promise.resolve(result) }
        }

        AsyncFunction("setDynamicHeaders") { headers: Map<String, String> ->
            sdk.setDynamicHeaders(headers)
        }

        AsyncFunction("setRouteContext") { context: Map<String, Any?> ->
            sdk.setRouteContext(context)
        }

        AsyncFunction("clearRouteContext") {
            sdk.clearRouteContext()
        }

        // ---------------------------------------------------------------
        // Persistence
        // ---------------------------------------------------------------

        AsyncFunction("getLocations") { query: Map<String, Any?>? ->
            sdk.getLocations(query)
        }

        AsyncFunction("getCount") { query: Map<String, Any?>? ->
            sdk.getCount(query)
        }

        AsyncFunction("destroyLocations") {
            sdk.destroyLocations()
        }

        AsyncFunction("destroySyncedLocations") {
            sdk.destroySyncedLocations()
        }

        AsyncFunction("destroyLocation") { uuid: String ->
            sdk.destroyLocation(uuid)
        }

        AsyncFunction("insertLocation") { params: Map<String, Any?> ->
            sdk.insertLocation(params)
        }

        // ---------------------------------------------------------------
        // Permissions & device state
        // ---------------------------------------------------------------

        AsyncFunction("getPermissionStatus") {
            sdk.getPermissionStatus()
        }

        AsyncFunction("getNotificationPermissionStatus") {
            sdk.getNotificationPermissionStatus()
        }

        AsyncFunction("getMotionPermissionStatus") {
            sdk.getMotionPermissionStatus()
        }

        AsyncFunction("requestPermission") { promise: expo.modules.kotlin.Promise ->
            sdk.activity = appContext.currentActivity
            sdk.requestPermission { status -> promise.resolve(status) }
        }

        AsyncFunction("requestNotificationPermission") { promise: expo.modules.kotlin.Promise ->
            sdk.activity = appContext.currentActivity
            sdk.requestNotificationPermission { status -> promise.resolve(status) }
        }

        AsyncFunction("requestMotionPermission") { promise: expo.modules.kotlin.Promise ->
            sdk.activity = appContext.currentActivity
            sdk.requestMotionPermission { status -> promise.resolve(status) }
        }

        AsyncFunction("isPowerSaveMode") {
            sdk.isPowerSaveMode()
        }

        AsyncFunction("isIgnoringBatteryOptimizations") {
            sdk.isIgnoringBatteryOptimizations()
        }

        AsyncFunction("requestSettings") { action: String ->
            sdk.requestSettings(action)
        }

        AsyncFunction("showSettings") { action: String ->
            sdk.showSettings(action)
        }

        AsyncFunction("getProviderState") {
            sdk.getProviderState()
        }

        AsyncFunction("getSensors") {
            sdk.getSensors()
        }

        AsyncFunction("getSettingsHealth") {
            sdk.getSettingsHealth()
        }

        AsyncFunction("openOemSettings") { label: String ->
            sdk.openOemSettings(label)
        }

        // ---------------------------------------------------------------
        // Logging
        // ---------------------------------------------------------------

        AsyncFunction("getLog") { query: Map<String, Any?>? ->
            sdk.getLog(query)
        }

        AsyncFunction("destroyLog") {
            sdk.destroyLog()
        }

        AsyncFunction("log") { level: String, message: String ->
            sdk.log(level, message)
        }

        AsyncFunction("playSound") { name: String ->
            sdk.playSound(name)
        }

        // ---------------------------------------------------------------
        // Lifecycle
        // ---------------------------------------------------------------

        OnDestroy {
            // Tracelet keeps the foreground service alive even when the module
            // tears down, which is exactly what we want for kill-resilience.
            // We do not call sdk.destroyAll() here — `stopOnTerminate=false`
            // (configured in `ready`) is what controls that contract.
        }
    }
}
