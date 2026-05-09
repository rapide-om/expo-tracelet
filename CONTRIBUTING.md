# Contributing to @rapide-om/expo-tracelet

Thank you for your interest in contributing. This document outlines the process and guidelines for contributing to this Expo Module.

## Table of Contents

- [Development Setup](#development-setup)
- [Repository Layout](#repository-layout)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing on a Device](#testing-on-a-device)
- [Pull Request Process](#pull-request-process)
- [Releasing](#releasing)
- [License](#license)

---

## Development Setup

Requirements:

- Bun ≥ 1.0
- Node.js ≥ 20 (for tooling that doesn't support Bun yet)
- Xcode ≥ 15 (for iOS builds)
- Android Studio + JDK 17 (for Android builds)
- A consuming Expo app (we develop against [`rapide-navigator`](https://github.com/rapide-om/rapide-navigator) using `bun add file:../expo-tracelet`)

```bash
git clone git@github.com:rapide-om/expo-tracelet.git
cd expo-tracelet
bun install
bun run build
```

## Repository Layout

```
expo-tracelet/
├── android/                 # Native Android bridge (Kotlin)
│   ├── build.gradle         # Pins `com.ikolvi:tracelet-sdk` version
│   └── src/main/java/om/rapide/tracelet/
│       ├── ExpoTraceletModule.kt        # Expo Module definition
│       └── RNTraceletEventSender.kt     # Bridges TraceletEventSender → sendEvent
├── ios/                     # Native iOS bridge (Swift)
│   ├── ExpoTracelet.podspec # Depends on TraceletSDK pod
│   ├── ExpoTraceletModule.swift
│   └── RNTraceletEventSender.swift
├── plugin/                  # Expo config plugin (TypeScript)
│   └── src/index.ts
├── src/                     # Public TypeScript API
│   ├── ExpoTracelet.types.ts
│   ├── ExpoTraceletModule.ts
│   └── index.ts
├── app.plugin.js            # Plugin entry point Expo loads
├── expo-module.config.json  # Expo Modules registration
└── package.json
```

## Development Workflow

### Build

```bash
bun run build         # Compile TS module + plugin
bun run build:plugin  # Plugin only
bun run clean         # Remove build artifacts
```

### Lint & Format

```bash
bun run lint          # expo-module lint
bun run lint:fix      # auto-fix
bun run format        # prettier --write .
bun run format:check  # CI gate
```

### Type Check

```bash
bun run typecheck
```

### Iterating against a real Expo app

The fastest dev loop is to consume this package via a `file:` path in a sibling Expo app:

```bash
# In your Expo app
bun add file:../expo-tracelet
bun expo prebuild --clean
bun expo run:android   # or run:ios
```

Native code changes require a rebuild of the consuming app (Metro alone won't pick them up).

## Code Standards

### TypeScript

- Use `import type` for type-only imports
- Prefer nullish coalescing (`??`) over logical OR (`||`)
- No `any` unless interfacing with untyped native payloads — and even then prefer `unknown` + a type guard
- Public types live in `src/ExpoTracelet.types.ts`; never re-shape Tracelet payloads inside bridge code

### Kotlin (Android)

- Follow Tracelet's API verbatim — every public bridge method maps 1:1 to a `TraceletSdk` method
- Forward all native exceptions through `Promise.reject` so JS callers see them
- Don't hold `appContext.reactContext` references across coroutines — use `applicationContext`

### Swift (iOS)

- Use `[weak self]` when capturing in escaping closures (event-sender callbacks)
- Bridge methods that return `[String: Any]` from `TraceletSdk` should return them directly — Expo Modules handles serialization

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add geofence support for iOS
fix: handle null route context in setRouteContext
docs: clarify permission flow in README
chore(release): v0.2.0
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`.

## Testing on a Device

We don't currently have a unit test suite — the value of tests for bridge code that just forwards calls to the upstream SDK is low. Verification happens via integration testing in a real Expo app on real hardware:

- **Android**: test on a Xiaomi or Huawei device for OEM battery-saver torture-testing. Verify foreground service survives swipe-away. Verify `BOOT_COMPLETED` triggers when the device reboots while tracking is active.
- **iOS**: test on a physical device (simulator can't deliver background location reliably). Verify `Always` permission flow. Verify significant-location-change relaunch after the app is killed by iOS.

When opening a PR for a behavioral change, include a short device test plan in the PR description.

## Pull Request Process

1. Fork and create a feature branch from `main`
2. Make changes following [Code Standards](#code-standards)
3. Run `bun run format && bun run lint && bun run typecheck && bun run build` locally
4. Add an entry to the **`[Unreleased]`** section of [CHANGELOG.md](./CHANGELOG.md)
5. Open a PR using the PR template; CI will run lint, format, typecheck, and build

## Releasing

Releases are automated via `.github/workflows/release.yml`. To cut a new version:

1. Bump `version` in `package.json`
2. Move `[Unreleased]` entries in `CHANGELOG.md` under a new `[x.y.z] - YYYY-MM-DD` heading
3. Commit with the message `chore(release): vX.Y.Z`
4. Push to `main` — the release workflow will publish to npm and create a GitHub Release

## License

By contributing, you agree that your contributions will be licensed under the [Apache-2.0 License](./LICENSE).
