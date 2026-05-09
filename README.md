# @rapide-om/expo-tracelet

**Force-kill-resilient driver location tracking for Expo apps.** A thin Expo Modules wrapper around the [Tracelet SDK](https://github.com/Ikolvi/Tracelet) — a Flutter-decoupled background-geolocation engine published to Maven Central and CocoaPods.

<p>
  <a href="https://github.com/rapide-om/expo-tracelet/actions"><img src="https://img.shields.io/github/actions/workflow/status/rapide-om/expo-tracelet/ci.yml?branch=main" alt="Build Status"></a>
  <a href="https://www.npmjs.com/package/@rapide-om/expo-tracelet"><img src="https://img.shields.io/npm/v/@rapide-om/expo-tracelet.svg" alt="Latest Release"></a>
  <a href="https://github.com/rapide-om/expo-tracelet/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@rapide-om/expo-tracelet.svg" alt="License"></a>
</p>

## Table of Contents

-   [Why this exists](#why-this-exists)
-   [Architecture](#architecture)
-   [Install](#install)
-   [Configuration](#configuration)
-   [Usage](#usage)
-   [API](#api)
-   [Permissions](#permissions)
-   [Versioning](#versioning)
-   [Troubleshooting](#troubleshooting)
-   [Contributing](#contributing)
-   [License](#license)

## Why this exists

The off-the-shelf options for Expo background tracking either:

-   **Don't survive force-kill on Android.** `expo-location` background updates are paused aggressively by iOS and killed by Android OEM battery managers (Xiaomi MIUI, Huawei EMUI, Samsung One UI). Unacceptable for delivery-driver apps.
-   **Cost $400/year.** `react-native-background-geolocation` (Transistorsoft) requires a paid commercial license for production use.

The Tracelet SDK is **Apache-2.0**, ships its native engines as conventional package-manager artifacts, and provides everything the Transistorsoft library does — foreground service with `foregroundServiceType="location"` + `START_REDELIVER_INTENT` + `stopWithTask=false`, BOOT_COMPLETED autostart, OEM-aware autostart deep-links, SQLite offline queue, OkHttp retry/backoff, Kalman GPS smoothing, motion detection, geofencing, scheduling.

This package writes ~500 lines of Expo bridge glue around those artifacts. **No source vendoring. No fork.** Upstream bug fixes ship as a version bump.

## Architecture

```
JS / TS (your app)
   │
   ▼  requireNativeModule('ExpoTracelet')
ExpoTraceletModule  ◄── thin Expo Modules bridge
   │
   ▼  TraceletSdk.getInstance(ctx)  /  TraceletSdk.shared
Tracelet SDK         ◄── upstream binary (AAR / Pod)
   │
   ▼
Foreground service · Boot receiver · SQLite queue · OkHttp sync · CoreLocation
```

| Layer                                                             | Source                                                                                                                                                                       | License    |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| TypeScript public API + Expo Modules bridge (Kotlin/Swift)        | This package                                                                                                                                                                 | Apache-2.0 |
| Background-tracking engine (foreground service, scheduling, sync) | [`com.ikolvi:tracelet-sdk`](https://repo1.maven.org/maven2/com/ikolvi/tracelet-sdk/) (Maven Central) and [`TraceletSDK`](https://cocoapods.org/pods/TraceletSDK) (CocoaPods) | Apache-2.0 |

## Install

```bash
bun add @rapide-om/expo-tracelet
bun expo prebuild --clean
```

> **Note:** New Architecture is required (Expo SDK 53+ defaults to it). The package depends on `ExpoModulesCore` and was tested against Expo SDK 55 / React Native 0.83.

## Configuration

Add the config plugin to your `app.config.js` or `app.json`:

```js
// app.config.js
module.exports = ({ config }) => ({
    ...config,
    plugins: [
        // ...other plugins
        [
            '@rapide-om/expo-tracelet',
            {
                locationAlwaysAndWhenInUseUsageDescription:
                    'We use your location to track active deliveries — including in the background.',
                locationWhenInUseUsageDescription: 'We use your location for live order tracking.',
                motionUsageDescription:
                    'We use motion data to detect when you start moving and conserve battery.',
            },
        ],
    ],
});
```

The plugin injects:

-   **iOS** `Info.plist`: `NSLocationAlwaysAndWhenInUseUsageDescription`, `NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysUsageDescription`, `NSMotionUsageDescription`, `UIBackgroundModes` (`location`, `fetch`, `processing`).
-   **Android** `AndroidManifest.xml`: required permissions (`FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_LOCATION`, `RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK`, `POST_NOTIFICATIONS`, `ACTIVITY_RECOGNITION`, location permissions). Tracelet's AAR ships its own services, receivers, and the foreground service registration via manifest merging.

## Usage

```ts
import * as Tracelet from '@rapide-om/expo-tracelet';

// 1. Initialize once on app start (after auth, when you have an API token)
await Tracelet.ready({
    geo: {
        desiredAccuracy: -1, // HIGH
        distanceFilter: 10,
    },
    app: {
        stopOnTerminate: false, // survive swipe-away on Android
        startOnBoot: true, // restart on device reboot
        foregroundService: true,
        heartbeatInterval: 60,
        debug: false,
    },
    http: {
        url: 'https://api.example.com/drivers/123/track',
        method: 'POST',
        headers: { Authorization: 'Bearer ...' },
        autoSync: true,
    },
});

// 2. Subscribe to events (returns a Subscription with .remove())
const subLoc = Tracelet.onLocation((loc) => {
    console.log('lat/lng', loc.coords.latitude, loc.coords.longitude);
});

const subEnabled = Tracelet.onEnabledChange(({ enabled }) => {
    console.log('tracking:', enabled);
});

// 3. Start / stop tracking
await Tracelet.start();
// ...later:
await Tracelet.stop();

// 4. Clean up listeners on unmount
subLoc.remove();
subEnabled.remove();
```

## API

### Lifecycle

| Method              | Returns          | Description                                                                |
| ------------------- | ---------------- | -------------------------------------------------------------------------- |
| `ready(config)`     | `Promise<State>` | Initialize subsystems. Must be called before any other method.             |
| `start()`           | `Promise<State>` | Start continuous-mode tracking.                                            |
| `stop()`            | `Promise<State>` | Stop tracking. Respects `app.stopOnTerminate=false` for survival behavior. |
| `startGeofences()`  | `Promise<State>` | Geofence-only mode (no continuous GPS — battery efficient).                |
| `startPeriodic()`   | `Promise<State>` | Periodic-fix mode (one-shot wake-ups instead of streaming GPS).            |
| `getState()`        | `Promise<State>` | Current SDK state.                                                         |
| `setConfig(config)` | `Promise<State>` | Update configuration mid-session.                                          |
| `reset(config?)`    | `Promise<State>` | Reset state and optionally apply new config.                               |

### Location

| Method                           | Returns                            |
| -------------------------------- | ---------------------------------- |
| `getCurrentPosition(options?)`   | `Promise<LocationPayload \| null>` |
| `getLastKnownLocation(options?)` | `Promise<LocationPayload \| null>` |
| `changePace(isMoving)`           | `Promise<boolean>`                 |
| `getOdometer()`                  | `Promise<number>`                  |
| `setOdometer(value)`             | `Promise<Record>`                  |

### HTTP sync

| Method                       | Returns                      |
| ---------------------------- | ---------------------------- |
| `sync()`                     | `Promise<LocationPayload[]>` |
| `setDynamicHeaders(headers)` | `Promise<void>`              |
| `setRouteContext(context)`   | `Promise<void>`              |
| `clearRouteContext()`        | `Promise<void>`              |

### Persistence

| Method                     | Returns                      |
| -------------------------- | ---------------------------- |
| `getLocations(query?)`     | `Promise<LocationPayload[]>` |
| `getCount(query?)`         | `Promise<number>`            |
| `destroyLocations()`       | `Promise<boolean>`           |
| `destroySyncedLocations()` | `Promise<number>`            |

### Events

```ts
addListener<E>(event, listener): EventSubscription
onLocation(cb)          // fires on every fresh location fix
onMotionChange(cb)      // device started/stopped moving
onActivityChange(cb)    // walking / driving / still
onProviderChange(cb)    // GPS enabled/disabled, permission changes
onHeartbeat(cb)         // periodic keep-alive
onHttp(cb)              // HTTP sync result
onEnabledChange(cb)     // tracking enabled/disabled
```

See [`src/ExpoTracelet.types.ts`](src/ExpoTracelet.types.ts) for the full set.

## Permissions

This package handles only **manifest registration**. You still need to request permissions from the user at runtime:

```ts
const status = await Tracelet.requestPermission(); // returns auth status code
const provider = await Tracelet.getProviderState();
```

For production apps you should also coach the user through:

-   iOS: granting `Always` (not just `When in Use`) for true background.
-   Android 11+: granting `Background Location` via the secondary system prompt.
-   Android: disabling battery optimization for your app (Xiaomi/Huawei/Samsung have additional autostart toggles).

## Versioning

This package pins to specific minor versions of the upstream Tracelet SDK in `android/build.gradle` and `ios/ExpoTracelet.podspec`. We bump those pins deliberately — never auto-update across MINOR boundaries. Breaking changes in the upstream SDK trigger a MAJOR bump in this package.

## Troubleshooting

**Build fails with `Could not find com.ikolvi:tracelet-sdk`.** The SDK is on Maven Central; ensure your `android/build.gradle` includes `mavenCentral()` in the project repositories block. Expo's default template does, but custom config plugins or vendor lock-ins may have removed it.

**iOS build fails with `Module 'TraceletSDK' not found`.** Run `bunx expo prebuild --clean` followed by `cd ios && pod install`.

**Location updates stop after force-killing the app on Android.** Verify the foreground notification is showing while the app is alive, then test swipe-away. If the notification disappears: check that the device's battery saver / autostart manager allows your app to run in the background. Use `Tracelet.openOemSettings('autostart')` to deep-link the user to their OEM's autostart settings.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Issues and PRs welcome.

## License

[Apache-2.0](./LICENSE) — same as upstream Tracelet. See [NOTICE](./NOTICE) for attribution.
