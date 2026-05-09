import ExpoModulesCore
import TraceletSDK

public class ExpoTraceletModule: Module {

    private let sdk = TraceletSdk.shared

    // Tracks the currently-alive module instance so that the event sender
    // closure (registered exactly once with TraceletSdk via `setEventSender`)
    // can route events to the latest module across JS reloads. Tracelet's
    // `setEventSender` precondition crashes if called after `ready()`, so we
    // can't re-register on reload — instead we keep one sender forever and
    // swap the pointer it dispatches through.
    private static weak var current: ExpoTraceletModule?
    private static var senderRegistered = false

    /// Run the given block on the main thread synchronously, returning its
    /// value. Apple's CLLocationManager docs require all configuration calls
    /// (`startUpdatingLocation`, `requestLocation`, delegate setup, …) to
    /// happen on a thread with a live runloop — i.e., the main thread. Expo
    /// Modules' `AsyncFunction` runs on a background queue, so wrapping each
    /// SDK invocation in `onMain` is required for `didUpdateLocations` to
    /// fire reliably. This was the root cause of `lastLocationTime: 0` and
    /// silent location-streaming failures in 0.1.x.
    private static func onMain<T>(_ block: () -> T) -> T {
        if Thread.isMainThread {
            return block()
        }
        return DispatchQueue.main.sync(execute: block)
    }

    public func definition() -> ModuleDefinition {
        Name("ExpoTracelet")

        OnCreate {
            ExpoTraceletModule.current = self
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
            "onBudgetAdjustment"
        )

        // ---------------------------------------------------------------
        // Lifecycle
        // ---------------------------------------------------------------

        AsyncFunction("ready") { (config: [String: Any]) -> [String: Any] in
            return Self.onMain {
                if !ExpoTraceletModule.senderRegistered {
                    self.sdk.setEventSender(RNTraceletEventSender { eventName, data in
                        ExpoTraceletModule.current?.sendEvent(eventName, data)
                    })
                    ExpoTraceletModule.senderRegistered = true
                }
                return self.sdk.ready(config: config)
            }
        }

        AsyncFunction("start") { () -> [String: Any] in
            return Self.onMain { self.sdk.start() }
        }

        AsyncFunction("stop") { () -> [String: Any] in
            return Self.onMain { self.sdk.stop() }
        }

        AsyncFunction("startGeofences") { () -> [String: Any] in
            return Self.onMain { self.sdk.startGeofences() }
        }

        AsyncFunction("startPeriodic") { () -> [String: Any] in
            return Self.onMain { self.sdk.startPeriodic() }
        }

        AsyncFunction("getState") { () -> [String: Any] in
            return Self.onMain { self.sdk.getState() }
        }

        AsyncFunction("setConfig") { (config: [String: Any]) -> [String: Any] in
            return Self.onMain { self.sdk.setConfig(config) }
        }

        AsyncFunction("reset") { (config: [String: Any]?) -> [String: Any] in
            return Self.onMain { self.sdk.reset(config) }
        }

        // ---------------------------------------------------------------
        // Location
        // ---------------------------------------------------------------

        AsyncFunction("getCurrentPosition") { (options: [String: Any], promise: Promise) in
            // getCurrentPosition uses an async callback, so dispatch the
            // outer call on main; the SDK's internal `requestLocation`
            // delegate fires on main automatically.
            DispatchQueue.main.async {
                self.sdk.getCurrentPosition(options: options) { result in
                    promise.resolve(result)
                }
            }
        }

        AsyncFunction("getLastKnownLocation") { (options: [String: Any]) -> [String: Any]? in
            return Self.onMain { self.sdk.getLastKnownLocation(options: options) }
        }

        AsyncFunction("watchPosition") { (options: [String: Any]) -> Int in
            return Self.onMain { self.sdk.watchPosition(options: options) }
        }

        AsyncFunction("stopWatchPosition") { (watchId: Int) -> Bool in
            return Self.onMain { self.sdk.stopWatchPosition(watchId) }
        }

        AsyncFunction("changePace") { (isMoving: Bool) -> Bool in
            return Self.onMain { self.sdk.changePace(isMoving) }
        }

        AsyncFunction("getOdometer") { () -> Double in
            return Self.onMain { self.sdk.getOdometer() }
        }

        AsyncFunction("setOdometer") { (value: Double) -> [String: Any] in
            return Self.onMain { self.sdk.setOdometer(value) }
        }

        // ---------------------------------------------------------------
        // HTTP sync
        // ---------------------------------------------------------------

        AsyncFunction("sync") { (promise: Promise) in
            DispatchQueue.main.async {
                self.sdk.sync { result in
                    promise.resolve(result)
                }
            }
        }

        AsyncFunction("setDynamicHeaders") { (headers: [String: String]) in
            Self.onMain { self.sdk.setDynamicHeaders(headers) }
        }

        AsyncFunction("setRouteContext") { (context: [String: Any]) in
            Self.onMain { self.sdk.setRouteContext(context) }
        }

        AsyncFunction("clearRouteContext") {
            Self.onMain { self.sdk.clearRouteContext() }
        }

        // ---------------------------------------------------------------
        // Persistence
        // ---------------------------------------------------------------

        AsyncFunction("getLocations") { (query: [String: Any]?) -> [[String: Any]] in
            return Self.onMain { self.sdk.getLocations(query: query) }
        }

        AsyncFunction("getCount") { (query: [String: Any]?) -> Int in
            return Self.onMain { self.sdk.getCount(query: query) }
        }

        AsyncFunction("destroyLocations") { () -> Bool in
            return Self.onMain { self.sdk.destroyLocations() }
        }

        AsyncFunction("destroySyncedLocations") { () -> Int in
            return Self.onMain { self.sdk.destroySyncedLocations() }
        }

        AsyncFunction("destroyLocation") { (uuid: String) -> Bool in
            return Self.onMain { self.sdk.destroyLocation(uuid) }
        }

        AsyncFunction("insertLocation") { (params: [String: Any]) -> String in
            return Self.onMain { self.sdk.insertLocation(params) }
        }

        // ---------------------------------------------------------------
        // Permissions & device state
        // ---------------------------------------------------------------

        AsyncFunction("getPermissionStatus") { () -> Int in
            return Self.onMain { self.sdk.getPermissionStatus() }
        }

        AsyncFunction("hasBackgroundPermission") { () -> Bool in
            return Self.onMain { self.sdk.hasBackgroundPermission }
        }

        AsyncFunction("isPowerSaveMode") { () -> Bool in
            return self.sdk.isPowerSaveMode
        }

        AsyncFunction("getProviderState") { () -> [String: Any] in
            return Self.onMain { self.sdk.getProviderState() }
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
            Self.onMain { self.sdk.onAppWillTerminate() }
        }

        AsyncFunction("autoResumeTracking") {
            Self.onMain { self.sdk.autoResumeTracking() }
        }
    }
}
