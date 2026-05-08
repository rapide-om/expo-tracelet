import ExpoModulesCore
import TraceletSDK

public class ExpoRapideTrackingModule: Module {

    private let sdk = TraceletSdk.shared

    public func definition() -> ModuleDefinition {
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
            "onBudgetAdjustment"
        )

        // ---------------------------------------------------------------
        // Lifecycle
        // ---------------------------------------------------------------

        AsyncFunction("ready") { (config: [String: Any]) -> [String: Any] in
            self.sdk.setEventSender(RNTraceletEventSender { [weak self] eventName, data in
                self?.sendEvent(eventName, data)
            })
            return self.sdk.ready(config: config)
        }

        AsyncFunction("start") { () -> [String: Any] in
            return self.sdk.start()
        }

        AsyncFunction("stop") { () -> [String: Any] in
            return self.sdk.stop()
        }

        AsyncFunction("startGeofences") { () -> [String: Any] in
            return self.sdk.startGeofences()
        }

        AsyncFunction("startPeriodic") { () -> [String: Any] in
            return self.sdk.startPeriodic()
        }

        AsyncFunction("getState") { () -> [String: Any] in
            return self.sdk.getState()
        }

        AsyncFunction("setConfig") { (config: [String: Any]) -> [String: Any] in
            return self.sdk.setConfig(config)
        }

        AsyncFunction("reset") { (config: [String: Any]?) -> [String: Any] in
            return self.sdk.reset(config)
        }

        // ---------------------------------------------------------------
        // Location
        // ---------------------------------------------------------------

        AsyncFunction("getCurrentPosition") { (options: [String: Any], promise: Promise) in
            self.sdk.getCurrentPosition(options: options) { result in
                promise.resolve(result)
            }
        }

        AsyncFunction("getLastKnownLocation") { (options: [String: Any]) -> [String: Any]? in
            return self.sdk.getLastKnownLocation(options: options)
        }

        AsyncFunction("watchPosition") { (options: [String: Any]) -> Int in
            return self.sdk.watchPosition(options: options)
        }

        AsyncFunction("stopWatchPosition") { (watchId: Int) -> Bool in
            return self.sdk.stopWatchPosition(watchId)
        }

        AsyncFunction("changePace") { (isMoving: Bool) -> Bool in
            return self.sdk.changePace(isMoving)
        }

        AsyncFunction("getOdometer") { () -> Double in
            return self.sdk.getOdometer()
        }

        AsyncFunction("setOdometer") { (value: Double) -> [String: Any] in
            return self.sdk.setOdometer(value)
        }

        // ---------------------------------------------------------------
        // HTTP sync
        // ---------------------------------------------------------------

        AsyncFunction("sync") { (promise: Promise) in
            self.sdk.sync { result in
                promise.resolve(result)
            }
        }

        AsyncFunction("setDynamicHeaders") { (headers: [String: String]) in
            self.sdk.setDynamicHeaders(headers)
        }

        AsyncFunction("setRouteContext") { (context: [String: Any]) in
            self.sdk.setRouteContext(context)
        }

        AsyncFunction("clearRouteContext") {
            self.sdk.clearRouteContext()
        }

        // ---------------------------------------------------------------
        // Persistence
        // ---------------------------------------------------------------

        AsyncFunction("getLocations") { (query: [String: Any]?) -> [[String: Any]] in
            return self.sdk.getLocations(query: query)
        }

        AsyncFunction("getCount") { (query: [String: Any]?) -> Int in
            return self.sdk.getCount(query: query)
        }

        AsyncFunction("destroyLocations") { () -> Bool in
            return self.sdk.destroyLocations()
        }

        AsyncFunction("destroySyncedLocations") { () -> Int in
            return self.sdk.destroySyncedLocations()
        }

        AsyncFunction("destroyLocation") { (uuid: String) -> Bool in
            return self.sdk.destroyLocation(uuid)
        }

        AsyncFunction("insertLocation") { (params: [String: Any]) -> String in
            return self.sdk.insertLocation(params)
        }

        // ---------------------------------------------------------------
        // Permissions & device state
        // ---------------------------------------------------------------

        AsyncFunction("getPermissionStatus") { () -> Int in
            return self.sdk.getPermissionStatus()
        }

        AsyncFunction("hasBackgroundPermission") { () -> Bool in
            return self.sdk.hasBackgroundPermission
        }

        AsyncFunction("isPowerSaveMode") { () -> Bool in
            return self.sdk.isPowerSaveMode
        }

        AsyncFunction("getProviderState") { () -> [String: Any] in
            return self.sdk.getProviderState()
        }

        AsyncFunction("getSensors") { () -> [String: Any] in
            return self.sdk.getSensors()
        }

        AsyncFunction("getDeviceInfo") { () -> [String: Any] in
            return self.sdk.getDeviceInfo()
        }

        // ---------------------------------------------------------------
        // Logging
        // ---------------------------------------------------------------

        AsyncFunction("getLog") { (query: [String: Any]?) -> String in
            return self.sdk.getLog(query: query)
        }

        AsyncFunction("destroyLog") { () -> Bool in
            return self.sdk.destroyLog()
        }

        AsyncFunction("log") { (level: String, message: String) in
            self.sdk.log(level, message)
        }

        AsyncFunction("playSound") { (name: String) -> Bool in
            return self.sdk.playSound(name)
        }

        // ---------------------------------------------------------------
        // App lifecycle hooks (iOS only)
        // ---------------------------------------------------------------

        AsyncFunction("onAppWillTerminate") {
            self.sdk.onAppWillTerminate()
        }

        AsyncFunction("autoResumeTracking") {
            self.sdk.autoResumeTracking()
        }
    }
}
