import type { EventSubscription } from 'expo-modules-core';

import ExpoTraceletModule from './ExpoTraceletModule';
import type {
    CurrentPositionOptions,
    ExpoTraceletEventName,
    ExpoTraceletEvents,
    LocationPayload,
    LocationsQuery,
    ProviderState,
    State,
    TraceletConfig,
} from './ExpoTracelet.types';

export * from './ExpoTracelet.types';

/**
 * Initialize the SDK. Must be called before any other method.
 *
 * Internally registers our event sender bridge so the native engine starts
 * delivering events to JS listeners as soon as `ready()` resolves.
 */
export function ready(config: TraceletConfig): Promise<State> {
    return ExpoTraceletModule.ready(config);
}

/** Start continuous-mode tracking. */
export function start(): Promise<State> {
    return ExpoTraceletModule.start();
}

/** Stop tracking. Respects `app.stopOnTerminate=false` for survival behavior. */
export function stop(): Promise<State> {
    return ExpoTraceletModule.stop();
}

/** Start geofence-only mode (no continuous GPS — battery efficient). */
export function startGeofences(): Promise<State> {
    return ExpoTraceletModule.startGeofences();
}

/** Start periodic-fix mode (one-shot wake-ups instead of streaming GPS). */
export function startPeriodic(): Promise<State> {
    return ExpoTraceletModule.startPeriodic();
}

export function getState(): Promise<State> {
    return ExpoTraceletModule.getState();
}

export function setConfig(config: TraceletConfig): Promise<State> {
    return ExpoTraceletModule.setConfig(config);
}

export function reset(config?: TraceletConfig | null): Promise<State> {
    return ExpoTraceletModule.reset(config ?? null);
}

// ---------------------------------------------------------------------------
// Location
// ---------------------------------------------------------------------------

export function getCurrentPosition(
    options: CurrentPositionOptions = {},
): Promise<LocationPayload | null> {
    return ExpoTraceletModule.getCurrentPosition(options);
}

export function getLastKnownLocation(
    options: { persist?: boolean; extras?: Record<string, unknown> } = {},
): Promise<LocationPayload | null> {
    return ExpoTraceletModule.getLastKnownLocation(options);
}

export function changePace(isMoving: boolean) {
    return ExpoTraceletModule.changePace(isMoving);
}

export function getOdometer(): Promise<number> {
    return ExpoTraceletModule.getOdometer();
}

export function setOdometer(value: number) {
    return ExpoTraceletModule.setOdometer(value);
}

// ---------------------------------------------------------------------------
// HTTP sync & route context
// ---------------------------------------------------------------------------

export function sync(): Promise<LocationPayload[]> {
    return ExpoTraceletModule.sync();
}

export function setDynamicHeaders(headers: Record<string, string>): Promise<void> {
    return ExpoTraceletModule.setDynamicHeaders(headers);
}

export function setRouteContext(context: Record<string, unknown>): Promise<void> {
    return ExpoTraceletModule.setRouteContext(context);
}

export function clearRouteContext(): Promise<void> {
    return ExpoTraceletModule.clearRouteContext();
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

export function getLocations(query?: LocationsQuery): Promise<LocationPayload[]> {
    return ExpoTraceletModule.getLocations(query);
}

export function getCount(query?: LocationsQuery): Promise<number> {
    return ExpoTraceletModule.getCount(query);
}

export function destroyLocations(): Promise<boolean> {
    return ExpoTraceletModule.destroyLocations();
}

export function destroySyncedLocations(): Promise<number> {
    return ExpoTraceletModule.destroySyncedLocations();
}

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

export function getPermissionStatus(): Promise<number> {
    return ExpoTraceletModule.getPermissionStatus();
}

export function requestPermission(): Promise<number> {
    return ExpoTraceletModule.requestPermission?.() ?? Promise.resolve(0);
}

export function getProviderState(): Promise<ProviderState> {
    return ExpoTraceletModule.getProviderState();
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export function addListener<E extends ExpoTraceletEventName>(
    event: E,
    listener: ExpoTraceletEvents[E],
): EventSubscription {
    return ExpoTraceletModule.addListener(event, listener as never);
}

export const onLocation = (cb: ExpoTraceletEvents['onLocation']) => addListener('onLocation', cb);
export const onMotionChange = (cb: ExpoTraceletEvents['onMotionChange']) =>
    addListener('onMotionChange', cb);
export const onActivityChange = (cb: ExpoTraceletEvents['onActivityChange']) =>
    addListener('onActivityChange', cb);
export const onProviderChange = (cb: ExpoTraceletEvents['onProviderChange']) =>
    addListener('onProviderChange', cb);
export const onHeartbeat = (cb: ExpoTraceletEvents['onHeartbeat']) =>
    addListener('onHeartbeat', cb);
export const onHttp = (cb: ExpoTraceletEvents['onHttp']) => addListener('onHttp', cb);
export const onEnabledChange = (cb: ExpoTraceletEvents['onEnabledChange']) =>
    addListener('onEnabledChange', cb);

/** Raw module access for advanced callers. Prefer the named helpers above. */
export { default as nativeModule } from './ExpoTraceletModule';

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
