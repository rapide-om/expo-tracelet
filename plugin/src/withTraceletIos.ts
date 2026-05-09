import { type ConfigPlugin, withInfoPlist } from 'expo/config-plugins';

import { type ExpoTraceletPluginProps } from './types';

const DEFAULT_LOCATION_USAGE =
    'This app uses your location to track deliveries while you are on shift, even when the app is in the background.';
const DEFAULT_MOTION_USAGE =
    'This app uses motion data to detect when you are moving and conserve battery.';

const REQUIRED_IOS_BACKGROUND_MODES = ['location', 'fetch', 'processing'];

export const withTraceletIos: ConfigPlugin<ExpoTraceletPluginProps | void> = (
    config,
    props = {},
) => {
    const {
        locationAlwaysAndWhenInUseUsageDescription = DEFAULT_LOCATION_USAGE,
        locationWhenInUseUsageDescription = locationAlwaysAndWhenInUseUsageDescription,
        motionUsageDescription = DEFAULT_MOTION_USAGE,
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

        return cfg;
    });
};
