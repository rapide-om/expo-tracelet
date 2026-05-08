# expo-rapide-tracking

Force-kill-resilient driver location tracking for Expo apps. Wraps the
[Tracelet SDK](https://github.com/Ikolvi/Tracelet) — a Flutter-decoupled
background-geolocation engine — with an Expo Modules bridge.

## Why this exists

The off-the-shelf options for Expo background tracking either:

- Rely on `expo-location` background updates, which iOS pauses aggressively and
  Android kills under battery pressure or after task-removal — unacceptable for
  a delivery app where the driver may swipe the app away mid-route.
- Require a paid commercial license (`react-native-background-geolocation` —
  $400/year) for the same engineering capabilities.

Tracelet is Apache-2.0 and ships its native engine as published artifacts on
**Maven Central** (`com.ikolvi:tracelet-sdk`) and **CocoaPods**
(`TraceletSDK`). This package writes ~500 lines of Expo bridge glue around
those artifacts — no source vendoring, no fork.

## Architecture

```
JS / TS (your app)
   │
   ▼  requireNativeModule('ExpoRapideTracking')
ExpoRapideTrackingModule  ◄── thin Expo Modules bridge
   │
   ▼  TraceletSdk.getInstance() / TraceletSdk.shared
Tracelet SDK              ◄── upstream binary (AAR / Pod)
   │
   ▼
Foreground service · Boot receiver · SQLite queue · OkHttp sync · CoreLocation
```

Upstream bug fixes ship as new SDK versions; we bump one version pin in
`android/build.gradle` and `ios/ExpoRapideTracking.podspec`.

## Install (from a consuming Expo app)

```bash
bun add github:rapide-om/expo-rapide-tracking
bun expo prebuild --clean
```

Then in `app.config.js`:

```js
plugins: [
  // ...other plugins
  ['expo-rapide-tracking', {
    locationAlwaysAndWhenInUseUsageDescription:
      'We use your location to track active deliveries.',
  }],
],
```

## Usage

```ts
import * as Tracking from 'expo-rapide-tracking';

await Tracking.ready({
  geo: {
    desiredAccuracy: -1,        // HIGH
    distanceFilter: 10,
  },
  app: {
    stopOnTerminate: false,     // survive swipe-away
    startOnBoot: true,
    foregroundService: true,
    debug: false,
  },
  http: {
    url: 'https://api.example.com/drivers/123/track',
    headers: { Authorization: 'Bearer ...' },
    autoSync: true,
  },
});

const sub = Tracking.onLocation((loc) => {
  console.log('location', loc.coords);
});

await Tracking.start();
// later:
sub.remove();
await Tracking.stop();
```

## Versioning policy

- Track the upstream Tracelet SDK MINOR version pin in this repo.
- Bump deliberately — never auto-update across MINOR boundaries.
- iOS and Android SDK versions are independent on the upstream side; we
  coordinate compatible pairs in this package.

## License

Apache-2.0 — same as upstream Tracelet. See [`LICENSE`](./LICENSE) and
[`NOTICE`](./NOTICE) for attribution.
