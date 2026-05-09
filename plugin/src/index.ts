import { type ConfigPlugin, withAndroidManifest, withInfoPlist } from 'expo/config-plugins';

type Props = {
    /**
     * iOS-only string shown in the location permission prompt.
     * Defaults to a generic driver-tracking message if unset. Override per-app
     * to comply with App Store review requirements.
     */
    locationAlwaysAndWhenInUseUsageDescription?: string;
    /**
     * iOS-only string shown when the app first requests foreground-only access.
     * Defaults to the same value as locationAlwaysAndWhenInUseUsageDescription.
     */
    locationWhenInUseUsageDescription?: string;
    /**
     * iOS-only string shown to motion-permission prompt (for activity-aware
     * tracking). Defaults to a generic message.
     */
    motionUsageDescription?: string;
};

const DEFAULT_LOCATION_USAGE =
    'This app uses your location to track deliveries while you are on shift, even when the app is in the background.';
const DEFAULT_MOTION_USAGE =
    'This app uses motion data to detect when you are moving and conserve battery.';

const REQUIRED_ANDROID_PERMISSIONS = [
    'android.permission.ACCESS_FINE_LOCATION',
    'android.permission.ACCESS_COARSE_LOCATION',
    'android.permission.ACCESS_BACKGROUND_LOCATION',
    'android.permission.FOREGROUND_SERVICE',
    'android.permission.FOREGROUND_SERVICE_LOCATION',
    'android.permission.RECEIVE_BOOT_COMPLETED',
    'android.permission.WAKE_LOCK',
    'android.permission.ACCESS_NETWORK_STATE',
    'android.permission.INTERNET',
    'android.permission.POST_NOTIFICATIONS',
    'android.permission.ACTIVITY_RECOGNITION',
];

const REQUIRED_IOS_BACKGROUND_MODES = ['location', 'fetch', 'processing'];

const withExpoTracelet: ConfigPlugin<Props | void> = (config, props = {}) => {
    const {
        locationAlwaysAndWhenInUseUsageDescription = DEFAULT_LOCATION_USAGE,
        locationWhenInUseUsageDescription = locationAlwaysAndWhenInUseUsageDescription,
        motionUsageDescription = DEFAULT_MOTION_USAGE,
    } = props ?? {};

    config = withInfoPlist(config, (cfg) => {
        const plist = cfg.modResults;
        plist.NSLocationAlwaysAndWhenInUseUsageDescription =
            plist.NSLocationAlwaysAndWhenInUseUsageDescription ??
            locationAlwaysAndWhenInUseUsageDescription;
        plist.NSLocationWhenInUseUsageDescription =
            plist.NSLocationWhenInUseUsageDescription ?? locationWhenInUseUsageDescription;
        plist.NSLocationAlwaysUsageDescription =
            plist.NSLocationAlwaysUsageDescription ?? locationAlwaysAndWhenInUseUsageDescription;
        plist.NSMotionUsageDescription = plist.NSMotionUsageDescription ?? motionUsageDescription;

        const existing = Array.isArray(plist.UIBackgroundModes) ? plist.UIBackgroundModes : [];
        const merged = Array.from(new Set([...existing, ...REQUIRED_IOS_BACKGROUND_MODES]));
        plist.UIBackgroundModes = merged;

        return cfg;
    });

    config = withAndroidManifest(config, (cfg) => {
        // Manifest merger handles dedup, but we declare permissions on the
        // host manifest as a belt-and-braces measure for tools that scan
        // the host manifest directly (Play Console, lint).
        const manifest = cfg.modResults.manifest;
        manifest['uses-permission'] = manifest['uses-permission'] ?? [];
        for (const name of REQUIRED_ANDROID_PERMISSIONS) {
            const has = manifest['uses-permission']!.some(
                (entry) => entry.$?.['android:name'] === name,
            );
            if (!has) {
                manifest['uses-permission']!.push({ $: { 'android:name': name } });
            }
        }
        return cfg;
    });

    return config;
};

export default withExpoTracelet;
