export type ExpoTraceletPluginProps = {
    /**
     * iOS-only string shown in the location permission prompt for "Always".
     * Defaults to a generic driver-tracking message if unset. Override per-app
     * to comply with App Store review requirements.
     */
    locationAlwaysAndWhenInUseUsageDescription?: string;

    /**
     * iOS-only string shown when the app first requests foreground-only
     * ("When in Use") access. Defaults to the same value as
     * `locationAlwaysAndWhenInUseUsageDescription` when unset.
     */
    locationWhenInUseUsageDescription?: string;

    /**
     * iOS-only string shown for the motion-permission prompt (used by
     * Tracelet's activity-aware tracking). Defaults to a generic message.
     */
    motionUsageDescription?: string;

    /**
     * iOS-only string for the `TraceletFullAccuracy` purpose key in
     * `NSLocationTemporaryUsageDescriptionDictionary`. Required for
     * Tracelet's `CLServiceSession` (iOS 18+) and
     * `requestTemporaryFullAccuracyAuthorization` calls — without this
     * key, iOS silently rejects the session and suppresses location
     * delivery entirely.
     */
    fullAccuracyUsageDescription?: string;
};
