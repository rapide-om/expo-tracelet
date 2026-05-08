import { NativeModule, requireNativeModule } from 'expo';

import type {
    CurrentPositionOptions,
    ExpoRapideTrackingEvents,
    Geofence,
    LocationPayload,
    LocationsQuery,
    ProviderState,
    State,
    TraceletConfig,
} from './ExpoRapideTracking.types';

declare class ExpoRapideTrackingModule extends NativeModule<ExpoRapideTrackingEvents> {
    // Lifecycle
    ready(config: TraceletConfig): Promise<State>;
    start(): Promise<State>;
    stop(): Promise<State>;
    startGeofences(): Promise<State>;
    startPeriodic(): Promise<State>;
    getState(): Promise<State>;
    setConfig(config: TraceletConfig): Promise<State>;
    reset(config?: TraceletConfig | null): Promise<State>;

    // Location
    getCurrentPosition(options?: CurrentPositionOptions): Promise<LocationPayload | null>;
    getLastKnownLocation(options?: { persist?: boolean; extras?: Record<string, unknown> }): Promise<LocationPayload | null>;
    watchPosition(options: Record<string, unknown>): Promise<number>;
    stopWatchPosition(watchId: number): Promise<boolean>;
    changePace(isMoving: boolean): Promise<boolean | Record<string, unknown>>;
    getOdometer(): Promise<number>;
    setOdometer(value: number): Promise<Record<string, unknown>>;

    // HTTP sync
    sync(): Promise<LocationPayload[]>;
    setDynamicHeaders(headers: Record<string, string>): Promise<void>;
    setRouteContext(context: Record<string, unknown>): Promise<void>;
    clearRouteContext(): Promise<void>;

    // Persistence
    getLocations(query?: LocationsQuery): Promise<LocationPayload[]>;
    getCount(query?: LocationsQuery): Promise<number>;
    destroyLocations(): Promise<boolean>;
    destroySyncedLocations(): Promise<number>;
    destroyLocation(uuid: string): Promise<boolean>;
    insertLocation(params: Partial<LocationPayload>): Promise<string>;

    // Geofences (Android-rich, iOS subset)
    addGeofence?(geofence: Geofence): Promise<boolean>;
    addGeofences?(geofences: Geofence[]): Promise<boolean>;
    removeGeofence?(identifier: string): Promise<boolean>;
    removeGeofences?(): Promise<boolean>;
    getGeofences?(): Promise<Geofence[]>;
    getGeofence?(identifier: string): Promise<Geofence | null>;
    geofenceExists?(identifier: string): Promise<boolean>;

    // Permissions / device state
    getPermissionStatus(): Promise<number>;
    getNotificationPermissionStatus?(): Promise<number>;
    getMotionPermissionStatus?(): Promise<number>;
    requestPermission?(): Promise<number>;
    requestNotificationPermission?(): Promise<number>;
    requestMotionPermission?(): Promise<number>;
    hasBackgroundPermission?(): Promise<boolean>;
    isPowerSaveMode(): Promise<boolean>;
    isIgnoringBatteryOptimizations?(): Promise<boolean>;
    requestSettings?(action: string): Promise<boolean>;
    showSettings?(action: string): Promise<boolean>;
    getProviderState(): Promise<ProviderState>;
    getSensors(): Promise<Record<string, unknown>>;
    getDeviceInfo?(): Promise<Record<string, unknown>>;
    getSettingsHealth?(): Promise<Record<string, unknown>>;
    openOemSettings?(label: string): Promise<boolean>;

    // Logs
    getLog(query?: Record<string, unknown>): Promise<string>;
    destroyLog(): Promise<boolean>;
    log(level: string, message: string): Promise<void>;
    playSound(name: string): Promise<boolean>;

    // iOS lifecycle hooks
    onAppWillTerminate?(): Promise<void>;
    autoResumeTracking?(): Promise<void>;
}

export default requireNativeModule<ExpoRapideTrackingModule>('ExpoRapideTracking');
