# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
