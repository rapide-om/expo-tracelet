import { type ConfigPlugin, withAndroidManifest } from 'expo/config-plugins';

import { type ExpoTraceletPluginProps } from './types';

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

/**
 * Tracelet's bundled AAR ships a manifest declaring the foreground service,
 * the BOOT_COMPLETED receiver, the geofence/alarm receivers, and all of these
 * permissions. Manifest merging pulls them into the host app automatically.
 *
 * We re-declare permissions on the *host* manifest defensively: some Play
 * Console review tooling and Android Lint reads only the host manifest and
 * misses merger-injected entries. The check is idempotent.
 */
export const withTraceletAndroid: ConfigPlugin<ExpoTraceletPluginProps | void> = (config) => {
    return withAndroidManifest(config, (cfg) => {
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
};
