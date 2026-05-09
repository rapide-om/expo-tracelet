import { type ConfigPlugin, withInfoPlist } from 'expo/config-plugins';

import { type ExpoTraceletPluginProps } from './types';

const DEFAULT_LOCATION_USAGE =
    'This app uses your location to track deliveries while you are on shift, even when the app is in the background.';
const DEFAULT_MOTION_USAGE =
    'This app uses motion data to detect when you are moving and conserve battery.';
// Required by Tracelet's iOS SDK for CLServiceSession(fullAccuracyPurposeKey:)
// and CLLocationManager.requestTemporaryFullAccuracyAuthorization(purposeKey:).
// iOS 18+ silently rejects the service session without this — which
// suppresses location delivery entirely (lastLocationTime stays at 0, no
// didUpdateLocations callback fires).
const TRACELET_FULL_ACCURACY_PURPOSE_KEY = 'TraceletFullAccuracy';
const DEFAULT_FULL_ACCURACY_USAGE =
    'Required for accurate driver tracking — we need full GPS precision while you are on shift.';

const REQUIRED_IOS_BACKGROUND_MODES = ['location', 'fetch', 'processing'];

export const withTraceletIos: ConfigPlugin<ExpoTraceletPluginProps | void> = (
    config,
    props = {},
) => {
    const {
        locationAlwaysAndWhenInUseUsageDescription = DEFAULT_LOCATION_USAGE,
        locationWhenInUseUsageDescription = locationAlwaysAndWhenInUseUsageDescription,
        motionUsageDescription = DEFAULT_MOTION_USAGE,
        fullAccuracyUsageDescription = DEFAULT_FULL_ACCURACY_USAGE,
    } = props ?? {};

    return withInfoPlist(config, (cfg) => {
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
        plist.UIBackgroundModes = Array.from(
            new Set([...existing, ...REQUIRED_IOS_BACKGROUND_MODES]),
        );

        // CLServiceSession (iOS 18+) and requestTemporaryFullAccuracyAuthorization
        // both need the purpose key declared in the plist or they silently fail.
        const existingDict =
            (plist.NSLocationTemporaryUsageDescriptionDictionary as
                | Record<string, string>
                | undefined) ?? {};
        plist.NSLocationTemporaryUsageDescriptionDictionary = {
            ...existingDict,
            [TRACELET_FULL_ACCURACY_PURPOSE_KEY]:
                existingDict[TRACELET_FULL_ACCURACY_PURPOSE_KEY] ?? fullAccuracyUsageDescription,
        };

        return cfg;
    });
};
