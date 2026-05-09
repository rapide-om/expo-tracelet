# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.4] - 2026-05-09

### Fixed

- **Critical: iOS location streaming silently broken — `didUpdateLocations` never fired.** Apple's `CLLocationManager` documentation requires all configuration calls (`startUpdatingLocation`, `requestLocation`, delegate setup, etc.) to happen on a thread with an active runloop — the main thread. Expo Modules' `AsyncFunction` runs handlers on a background queue, so our previous bridge was calling `TraceletSdk.start() → locationManager.startUpdatingLocation()` from a non-main thread. iOS silently accepted the call but never delivered delegate callbacks, leaving `lastLocationTime` pinned at `0`, `getCurrentPosition` returning `nil`, and no `onLocation` events ever emitted. The Flutter plugin works because Pigeon HostApi runs on the main queue. The bridge now wraps every SDK invocation in a `DispatchQueue.main.sync` (or `.async` for callback-based methods) so CLLocationManager operates on the main thread as required.

## [0.1.3] - 2026-05-09

### Fixed

- **iOS 18+ silent location-delivery suppression.** Tracelet's iOS SDK creates a `CLServiceSession(authorization: .always, fullAccuracyPurposeKey: "TraceletFullAccuracy")` and calls `CLLocationManager.requestTemporaryFullAccuracyAuthorization(withPurposeKey: "TraceletFullAccuracy")`. Both APIs require the consuming app's `Info.plist` to declare the `TraceletFullAccuracy` key inside `NSLocationTemporaryUsageDescriptionDictionary`. Without it, iOS 18+ silently rejects the service session — `didUpdateLocations` never fires, `getCurrentPosition` returns nil, and `lastLocationTime` stays pinned at `0` even after a successful `start()`. The iOS config plugin now auto-injects the dictionary entry. Override the message via the new `fullAccuracyUsageDescription` plugin prop.

## [0.1.2] - 2026-05-08

### Fixed

- **iOS hard crash on JS reload / second `ready()` call.** Tracelet's iOS `setEventSender` has a `precondition(!isReady)` guard that crashes the app if called after the SDK has been initialized. Because `TraceletSdk.shared` is a process-wide singleton (and iOS keeps the process alive between launches when `stopOnTerminate: false`), the second call to `Tracking.ready()` from JS would hit that precondition. The bridge now registers the sender exactly once per process and dispatches via a static `current` pointer that's updated on each `OnCreate`.
- **Stale module reference after JS reload (iOS + Android).** The previous closure captured `self`/`this@ExpoTraceletModule.sendEvent`, which referred to the module instance that existed at the time of `ready()`. After a Metro reload the original module is destroyed and a new one is created, but the captured reference stayed pointed at the dead instance — meaning location events were emitted by Tracelet but silently dropped because the receiver was no longer alive. The new static-current pattern keeps events flowing across reloads on both platforms.

## [0.1.1] - 2026-05-08

### Fixed

- **Android Kotlin metadata mismatch**: Tracelet 1.1.x ships `kotlin-stdlib:2.3.x` metadata, but Expo SDK 55 / RN 0.83 use Kotlin 2.1. Without intervention, every consuming app failed to build with `Module was compiled with an incompatible version of Kotlin. The binary version of its metadata is 2.3.0, expected version is 2.1.0.` The Android side of the config plugin now patches `android/build.gradle` (via `withProjectBuildGradle`) to inject `-Xskip-metadata-version-check` into every Kotlin compile task. Idempotent — the patch is fingerprinted and skipped if already present.
- Documented the consumer-side `expo-build-properties.android.minSdkVersion: 26` requirement (Tracelet's AAR declares `minSdk=26`, will fail manifest merging on lower).

## [0.1.0] - 2026-05-08

### Added

- Initial release. Expo Module bridge wrapping the [Tracelet SDK](https://github.com/Ikolvi/Tracelet) v1.1.4.
- **Android bridge** (`ExpoTraceletModule.kt` + `RNTraceletEventSender.kt`) depending on `com.ikolvi:tracelet-sdk` (Maven Central). Forwards all 18 Tracelet event channels (location, motion, activity, geofence, heartbeat, http, etc.) and exposes 50+ async functions.
- **iOS bridge** (`ExpoTraceletModule.swift` + `RNTraceletEventSender.swift`) depending on `TraceletSDK` (CocoaPods). Same surface area as Android.
- **TypeScript public API** with typed events, lifecycle, location, HTTP sync, persistence, and permissions surfaces. Exports both named functions and a default namespace.
- **Config plugin** (`plugin/src/`) that injects iOS `Info.plist` background modes (`location`, `fetch`, `processing`) and usage strings (`NSLocationAlwaysAndWhenInUseUsageDescription`, `NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysUsageDescription`, `NSMotionUsageDescription`), plus Android manifest permissions (`FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_LOCATION`, `RECEIVE_BOOT_COMPLETED`, etc.).
  - Split into platform-specific modules (`withTraceletIos.ts`, `withTraceletAndroid.ts`, `types.ts`) per [Expo's library plugin guidelines](https://docs.expo.dev/config-plugins/development-for-libraries/).
  - Wrapped with `createRunOncePlugin(plugin, pkg.name, pkg.version)` so duplicate registrations across the dependency tree don't double-inject.
  - `plugin/tsconfig.json` extends `expo-module-scripts/tsconfig.plugin`; build runs through `expo-module build plugin`.
- **`sideEffects: false`** declared in `package.json` for tree-shaking under bun, webpack, rollup, and metro.
- **CI/CD pipeline** (`.github/workflows/`):
  - `ci.yml`: format:check, lint, typecheck, build on every PR/push
  - `release.yml`: gated by `chore(release):` commit prefix; publishes to public npm with `--provenance` and creates a GitHub Release from CHANGELOG entries
  - `autofix.yml`: prettier + lint:fix via [autofix.ci](https://autofix.ci/) on PRs
  - `dependabot.yml`: weekly npm and monthly GitHub Actions updates, grouped
- **Tooling**: ESLint 9 flat config (`eslint.config.js`) with `@eslint/js` + `typescript-eslint`. Prettier 3 with shared config (`prettier.config.js`).
- **Documentation**: README with badges, install/usage/API tables, troubleshooting; CONTRIBUTING.md covering the dev loop and device test guidance; SECURITY.md with upstream-vs-bridge scope split; issue + PR templates.

### Notes

- Architecture: this package owns ~500 lines of TypeScript + Kotlin + Swift bridge glue. The background-tracking engine itself (foreground service, scheduling, sync, OEM workarounds) lives in upstream Tracelet and ships as Maven Central / CocoaPods artifacts. Upstream bug fixes ship as a single version-pin bump in `android/build.gradle` and `ios/ExpoTracelet.podspec`.
- License: Apache-2.0, matching upstream Tracelet. See [`NOTICE`](./NOTICE) for attribution.
