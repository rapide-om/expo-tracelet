import type { EventSubscription } from 'expo-modules-core';

import ExpoRapideTrackingModule from './ExpoRapideTrackingModule';
import type {
    CurrentPositionOptions,
    ExpoRapideTrackingEventName,
    ExpoRapideTrackingEvents,
    LocationPayload,
    LocationsQuery,
    ProviderState,
    State,
    TraceletConfig,
} from './ExpoRapideTracking.types';

export * from './ExpoRapideTracking.types';

/**
 * Initialize the SDK. Must be called before any other method.
 *
 * Internally registers our event sender bridge so the native engine starts
 * delivering events to JS listeners as soon as `ready()` resolves.
 */
export function ready(config: TraceletConfig): Promise<State> {
    return ExpoRapideTrackingModule.ready(config);
}

/** Start continuous-mode tracking. */
export function start(): Promise<State> {
    return ExpoRapideTrackingModule.start();
}

/** Stop tracking. Respects `app.stopOnTerminate=false` for survival behavior. */
export function stop(): Promise<State> {
    return ExpoRapideTrackingModule.stop();
}

/** Start geofence-only mode (no continuous GPS — battery efficient). */
export function startGeofences(): Promise<State> {
    return ExpoRapideTrackingModule.startGeofences();
}

/** Start periodic-fix mode (one-shot wake-ups instead of streaming GPS). */
export function startPeriodic(): Promise<State> {
    return ExpoRapideTrackingModule.startPeriodic();
}

export function getState(): Promise<State> {
    return ExpoRapideTrackingModule.getState();
}

export function setConfig(config: TraceletConfig): Promise<State> {
    return ExpoRapideTrackingModule.setConfig(config);
}

export function reset(config?: TraceletConfig | null): Promise<State> {
    return ExpoRapideTrackingModule.reset(config ?? null);
}

// ---------------------------------------------------------------------------
// Location
// ---------------------------------------------------------------------------

export function getCurrentPosition(options: CurrentPositionOptions = {}): Promise<LocationPayload | null> {
    return ExpoRapideTrackingModule.getCurrentPosition(options);
}

export function getLastKnownLocation(
    options: { persist?: boolean; extras?: Record<string, unknown> } = {}
): Promise<LocationPayload | null> {
    return ExpoRapideTrackingModule.getLastKnownLocation(options);
}

export function changePace(isMoving: boolean) {
    return ExpoRapideTrackingModule.changePace(isMoving);
}

export function getOdometer(): Promise<number> {
    return ExpoRapideTrackingModule.getOdometer();
}

export function setOdometer(value: number) {
    return ExpoRapideTrackingModule.setOdometer(value);
}

// ---------------------------------------------------------------------------
// HTTP sync & route context
// ---------------------------------------------------------------------------

export function sync(): Promise<LocationPayload[]> {
    return ExpoRapideTrackingModule.sync();
}

export function setDynamicHeaders(headers: Record<string, string>): Promise<void> {
    return ExpoRapideTrackingModule.setDynamicHeaders(headers);
}

export function setRouteContext(context: Record<string, unknown>): Promise<void> {
    return ExpoRapideTrackingModule.setRouteContext(context);
}

export function clearRouteContext(): Promise<void> {
    return ExpoRapideTrackingModule.clearRouteContext();
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

export function getLocations(query?: LocationsQuery): Promise<LocationPayload[]> {
    return ExpoRapideTrackingModule.getLocations(query);
}

export function getCount(query?: LocationsQuery): Promise<number> {
    return ExpoRapideTrackingModule.getCount(query);
}

export function destroyLocations(): Promise<boolean> {
    return ExpoRapideTrackingModule.destroyLocations();
}

export function destroySyncedLocations(): Promise<number> {
    return ExpoRapideTrackingModule.destroySyncedLocations();
}

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

export function getPermissionStatus(): Promise<number> {
    return ExpoRapideTrackingModule.getPermissionStatus();
}

export function requestPermission(): Promise<number> {
    return ExpoRapideTrackingModule.requestPermission?.() ?? Promise.resolve(0);
}

export function getProviderState(): Promise<ProviderState> {
    return ExpoRapideTrackingModule.getProviderState();
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export function addListener<E extends ExpoRapideTrackingEventName>(
    event: E,
    listener: ExpoRapideTrackingEvents[E]
): EventSubscription {
    return ExpoRapideTrackingModule.addListener(event, listener as never);
}

export const onLocation = (cb: ExpoRapideTrackingEvents['onLocation']) => addListener('onLocation', cb);
export const onMotionChange = (cb: ExpoRapideTrackingEvents['onMotionChange']) => addListener('onMotionChange', cb);
export const onActivityChange = (cb: ExpoRapideTrackingEvents['onActivityChange']) => addListener('onActivityChange', cb);
export const onProviderChange = (cb: ExpoRapideTrackingEvents['onProviderChange']) => addListener('onProviderChange', cb);
export const onHeartbeat = (cb: ExpoRapideTrackingEvents['onHeartbeat']) => addListener('onHeartbeat', cb);
export const onHttp = (cb: ExpoRapideTrackingEvents['onHttp']) => addListener('onHttp', cb);
export const onEnabledChange = (cb: ExpoRapideTrackingEvents['onEnabledChange']) => addListener('onEnabledChange', cb);

/** Raw module access for advanced callers. Prefer the named helpers above. */
export { default as nativeModule } from './ExpoRapideTrackingModule';

export default {
    ready,
    start,
    stop,
    startGeofences,
    startPeriodic,
    getState,
    setConfig,
    reset,
    getCurrentPosition,
    getLastKnownLocation,
    changePace,
    getOdometer,
    setOdometer,
    sync,
    setDynamicHeaders,
    setRouteContext,
    clearRouteContext,
    getLocations,
    getCount,
    destroyLocations,
    destroySyncedLocations,
    getPermissionStatus,
    requestPermission,
    getProviderState,
    addListener,
    onLocation,
    onMotionChange,
    onActivityChange,
    onProviderChange,
    onHeartbeat,
    onHttp,
    onEnabledChange,
};
