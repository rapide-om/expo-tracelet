// Type definitions for the public API. The shapes mirror Tracelet's
// configuration and event payloads — see the upstream docs at
// https://github.com/Ikolvi/Tracelet for the full source of truth.

export type Coords = {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number;
    altitudeAccuracy: number;
    heading: number;
    speed: number;
};

export type Battery = {
    is_charging: boolean;
    level: number;
};

export type Activity = {
    type: 'still' | 'on_foot' | 'walking' | 'running' | 'on_bicycle' | 'in_vehicle' | 'unknown';
    confidence: number;
};

export type LocationPayload = {
    uuid?: string;
    timestamp: string;
    is_moving: boolean;
    coords: Coords;
    activity: Activity;
    battery: Battery;
    odometer?: number;
    event?: 'motionchange' | 'providerchange' | 'heartbeat' | 'getCurrentPosition' | string;
    [extra: string]: unknown;
};

export type DesiredAccuracy = number; // mirrors CLLocationAccuracy / Android constants

export type GeoConfig = {
    desiredAccuracy?: DesiredAccuracy;
    distanceFilter?: number;
    stationaryRadius?: number;
    locationUpdateInterval?: number;
    fastestLocationUpdateInterval?: number;
    activityRecognitionInterval?: number;
    minimumActivityRecognitionConfidence?: number;
    disableMotionActivityUpdates?: boolean;
    disableElasticity?: boolean;
    elasticityMultiplier?: number;
    deferTime?: number;
    geofenceProximityRadius?: number;
    geofenceInitialTriggerEntry?: boolean;
    locationAuthorizationRequest?: 'Always' | 'WhenInUse' | 'Any';
};

export type AppConfig = {
    debug?: boolean;
    logLevel?: 'OFF' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'VERBOSE';
    logMaxDays?: number;
    reset?: boolean;
    autoSync?: boolean;
    autoSyncThreshold?: number;
    batchSync?: boolean;
    maxBatchSize?: number;
    maxRecordsToPersist?: number;
    locationsOrderDirection?: 'ASC' | 'DESC';
    persistMode?: -1 | 0 | 1 | 2;
    stopOnTerminate?: boolean;
    startOnBoot?: boolean;
    stopAfterElapsedMinutes?: number;
    heartbeatInterval?: number;
    preventSuspend?: boolean;
    foregroundService?: boolean;
    notification?: NotificationConfig;
};

export type NotificationConfig = {
    title?: string;
    text?: string;
    channelName?: string;
    smallIcon?: string;
    largeIcon?: string;
    color?: string;
    priority?: number;
    sticky?: boolean;
    strings?: Record<string, string>;
    actions?: Array<{ id: string; title: string; icon?: string }>;
};

export type HttpConfig = {
    url?: string;
    method?: 'POST' | 'PUT';
    httpRootProperty?: string;
    locationTemplate?: string;
    geofenceTemplate?: string;
    headers?: Record<string, string>;
    params?: Record<string, unknown>;
    extras?: Record<string, unknown>;
    autoSync?: boolean;
    autoSyncThreshold?: number;
    batchSync?: boolean;
    maxBatchSize?: number;
    maxRecordsToPersist?: number;
};

export type TraceletConfig = {
    geo?: GeoConfig;
    app?: AppConfig;
    http?: HttpConfig;
    schedule?: string[];
    [extra: string]: unknown;
};

export type State = {
    enabled: boolean;
    isMoving: boolean;
    trackingMode?: string;
    schedulerEnabled?: boolean;
    odometer?: number;
    [extra: string]: unknown;
};

export type ProviderState = {
    enabled: boolean;
    status: number;
    gps: boolean;
    network: boolean;
};

export type Geofence = {
    identifier: string;
    latitude: number;
    longitude: number;
    radius: number;
    notifyOnEntry?: boolean;
    notifyOnExit?: boolean;
    notifyOnDwell?: boolean;
    loiteringDelay?: number;
    extras?: Record<string, unknown>;
};

export type ExpoRapideTrackingEvents = {
    onLocation: (payload: LocationPayload) => void;
    onMotionChange: (payload: { isMoving: boolean; location: LocationPayload }) => void;
    onActivityChange: (payload: Activity) => void;
    onProviderChange: (payload: ProviderState) => void;
    onGeofence: (payload: { identifier: string; action: 'ENTER' | 'EXIT' | 'DWELL'; location: LocationPayload }) => void;
    onGeofencesChange: (payload: { on: string[]; off: string[] }) => void;
    onHeartbeat: (payload: { location: LocationPayload }) => void;
    onHttp: (payload: { success: boolean; status: number; responseText?: string }) => void;
    onSchedule: (payload: State) => void;
    onPowerSaveChange: (payload: { isPowerSaveMode: boolean }) => void;
    onConnectivityChange: (payload: { connected: boolean }) => void;
    onEnabledChange: (payload: { enabled: boolean }) => void;
    onNotificationAction: (payload: Record<string, unknown>) => void;
    onAuthorization: (payload: Record<string, unknown>) => void;
    onWatchPosition: (payload: LocationPayload) => void;
    onRemoteConfig: (payload: { config: Record<string, unknown>; source: 'remote' }) => void;
    onTrip: (payload: Record<string, unknown>) => void;
    onBudgetAdjustment: (payload: Record<string, unknown>) => void;
};

export type ExpoRapideTrackingEventName = keyof ExpoRapideTrackingEvents;

export type CurrentPositionOptions = {
    timeout?: number;
    maximumAge?: number;
    persist?: boolean;
    samples?: number;
    desiredAccuracy?: DesiredAccuracy;
    extras?: Record<string, unknown>;
};

export type LocationsQuery = {
    limit?: number;
    offset?: number;
    order?: number;
    start?: number;
    end?: number;
};
