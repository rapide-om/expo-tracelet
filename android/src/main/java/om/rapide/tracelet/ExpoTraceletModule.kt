package om.rapide.tracelet

import com.ikolvi.tracelet.sdk.TraceletSdk
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoTraceletModule : Module() {

    private val sdk: TraceletSdk by lazy {
        TraceletSdk.getInstance(appContext.reactContext!!.applicationContext)
    }

    companion object {
        // Tracks the currently-alive module instance so the event sender
        // closure can route events to the latest module across JS reloads.
        // Tracelet's TraceletSdk is a process-singleton; we want to register
        // the sender once and have it survive React Context teardowns.
        @Volatile
        private var current: ExpoTraceletModule? = null

        @Volatile
        private var senderRegistered = false
    }

    override fun definition() = ModuleDefinition {
        Name("ExpoTracelet")

        OnCreate {
            current = this@ExpoTraceletModule
        }

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
            // Register the event sender + initialize the SDK exactly once per
            // process. The closure dispatches through the static `current`
            // pointer so reloads keep working even though the original module
            // instance dies when the React Context is torn down.
            //
            // Android's TraceletSdk requires an explicit initialize() between
            // setEventSender() and ready() — initialize() is what assigns the
            // lateinit subsystems (configManager, locationEngine, etc.). The
            // Flutter plugin follows the same setEventSender→initialize→ready
            // sequence (TraceletAndroidPlugin onAttachedToEngine, primary
            // instance branch). Skipping initialize() throws
            // UninitializedPropertyAccessException("configManager has not
            // been initialized") inside ready() when configManager.setConfig()
            // is called.
            //
            // iOS has no analog — its ready() handles subsystem creation
            // lazily, which is why this bug only surfaced on Android.
            if (!senderRegistered) {
                sdk.setEventSender(RNTraceletEventSender { eventName, data ->
                    current?.sendEvent(eventName, data)
                })
                sdk.initialize()
                senderRegistered = true
            }
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
