import {
    type ConfigPlugin,
    withAndroidManifest,
    withProjectBuildGradle,
} from 'expo/config-plugins';

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

const KOTLIN_METADATA_GUARD_MARKER = '// [@rapide-om/expo-tracelet] kotlin-metadata-guard';
const KOTLIN_METADATA_GUARD = `
  // [@rapide-om/expo-tracelet] kotlin-metadata-guard
  // The Tracelet SDK ships kotlin-stdlib 2.3.x metadata while Expo SDK 55 /
  // RN 0.83 default to Kotlin 2.1. The 2.1 compiler can read 2.3 stdlib
  // metadata when the version-check guard is suppressed. This block injects
  // \`-Xskip-metadata-version-check\` into every Kotlin compile task in the
  // project. Idempotent: removed/re-added by \`expo prebuild --clean\`.
  tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
    kotlinOptions {
      freeCompilerArgs += '-Xskip-metadata-version-check'
    }
  }`;

/**
 * Tracelet's bundled AAR ships a manifest declaring the foreground service,
 * the BOOT_COMPLETED receiver, the geofence/alarm receivers, and all of these
 * permissions. Manifest merging pulls them into the host app automatically.
 *
 * We re-declare permissions on the *host* manifest defensively: some Play
 * Console review tooling and Android Lint reads only the host manifest and
 * misses merger-injected entries.
 *
 * We also patch `android/build.gradle` to inject `-Xskip-metadata-version-check`
 * into every Kotlin compile task so the host's Kotlin 2.1 toolchain accepts
 * the upstream SDK's 2.3 stdlib metadata. Without this the build fails with
 * "Module was compiled with an incompatible version of Kotlin."
 */
export const withTraceletAndroid: ConfigPlugin<ExpoTraceletPluginProps | void> = (config) => {
    config = withAndroidManifest(config, (cfg) => {
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

    config = withProjectBuildGradle(config, (cfg) => {
        if (cfg.modResults.language !== 'groovy') {
            return cfg;
        }
        if (cfg.modResults.contents.includes(KOTLIN_METADATA_GUARD_MARKER)) {
            return cfg;
        }
        // Inject inside the existing `allprojects { ... }` block so the
        // configuration applies to every subproject's Kotlin compile tasks.
        const allprojectsRegex = /allprojects\s*\{([\s\S]*?)\n\}/;
        const match = cfg.modResults.contents.match(allprojectsRegex);
        if (match) {
            cfg.modResults.contents = cfg.modResults.contents.replace(allprojectsRegex, (full) =>
                full.replace(/\n\}\s*$/, `\n${KOTLIN_METADATA_GUARD}\n}`),
            );
        } else {
            // No allprojects block found; append a new one. Defensive — Expo's
            // generated build.gradle always has one, but this keeps the plugin
            // robust against template drift.
            cfg.modResults.contents += `\nallprojects {${KOTLIN_METADATA_GUARD}\n}\n`;
        }
        return cfg;
    });

    return config;
};
