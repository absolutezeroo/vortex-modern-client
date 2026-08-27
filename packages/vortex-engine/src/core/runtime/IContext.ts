import type {EventEmitter} from 'eventemitter3';
import type {IID} from './IID';
import type {IDisposable} from './IDisposable';
import type {ICoreConfiguration} from './ICoreConfiguration';
import type {Component} from './Component';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {ILinkEventTracker} from './events/ILinkEventTracker';

/**
 * Queue callback for interface resolution
 */
export type InterfaceCallback<T = unknown> = (iid: IID<T>, instance: T) => void;

/**
 * The central container that manages components and their dependencies: registration and
 * lifecycle, resolution through `queueInterface`, and event propagation between components.
 *
 * **Traced to `_SafeCls_54`, not to PRODUCTION's `IContext.as`.** The 2026 context interface is
 * `_SafeCls_57 extends _SafeCls_54, _SafeCls_49`, and `_SafeCls_54` is the half this port
 * mirrors — assets/events/root/configuration, attach/detachComponent, the update receivers, the
 * link-event trackers, and error/warning/debug. Every trace below pointed at the 2016 file until
 * 2026-08-27; the members are the same, but the primary tree is the current build.
 *
 * What `_SafeCls_57` adds on top is deliberately not ported — a `fileProxy` and its persistence
 * methods, `readConfigDocument`, `setProfilerMode`, the loader counters, `arguments`, and
 * `initialize`/`purge`/`hibernate`/`resume`. All of it is AIR plumbing with no caller anywhere in
 * the primary tree outside `core/runtime`, and a browser has no file proxy. See
 * docs/IMPLEMENTATION_STATUS.md → the FakeContext entry.
 *
 * Eight members of `_SafeCls_54` are also out. `getLastErrorMessage`, `getLastDebugMessage` and
 * `getLastWarningMessage` because this port's `Logger` owns that history; `loadFromFile`,
 * `get displayObjectContainer`, `toXMLString`, `prepareComponent` and `prepareAssetLibrary`
 * because they are Flash display-list and file-system entry points.
 */
export interface IContext extends IDisposable
{
    /**
	 * Event emitter for context-level events
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/runtime/_SafeCls_54.as::get events()
    readonly events: EventEmitter;

    /**
	 * Root context (top of the hierarchy)
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/runtime/_SafeCls_54.as::get root()
    readonly root: IContext;

    /**
	 * Configuration manager
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/runtime/_SafeCls_54.as::get configuration()
    configuration: ICoreConfiguration | null;

    /**
	 * Asset library for this context
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/runtime/_SafeCls_54.as::get assets()
    readonly assets: IAssetLibrary | null;

    /**
	 * Request an interface from the context.
	 *
	 * If the interface is available, returns the instance immediately.
	 * If not available yet, queues the callback to be called when it becomes available.
	 *
	 * @param iid Interface identifier to request
	 * @param callback Optional callback when interface becomes available
	 * @returns The interface instance if available, null if queued
	 */
    queueInterface<T>(iid: IID<T>, callback?: InterfaceCallback<T>): T | null;

    /**
	 * Attach a component to this context
	 *
	 * @param component The component to attach
	 * @param interfaces Array of interface IDs this component provides
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/runtime/_SafeCls_54.as::attachComponent()
    attachComponent(component: Component, interfaces: IID[]): void;

    /**
	 * Detach a component from this context
	 *
	 * @param component The component to detach
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/runtime/_SafeCls_54.as::detachComponent()
    detachComponent(component: Component): void;

    /**
	 * Register an update receiver to be called each frame
	 *
	 * @param receiver Object with update method
	 * @param priority Update priority (lower = earlier)
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/runtime/_SafeCls_54.as::registerUpdateReceiver()
    registerUpdateReceiver(receiver: IUpdateReceiver, priority: number): void;

    /**
	 * Remove an update receiver
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/runtime/_SafeCls_54.as::removeUpdateReceiver()
    removeUpdateReceiver(receiver: IUpdateReceiver): void;

    /**
	 * Add a link event tracker
	 *
	 * @param tracker The tracker to add
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/runtime/_SafeCls_54.as::addLinkEventTracker()
    addLinkEventTracker(tracker: ILinkEventTracker): void;

    /**
	 * Remove a link event tracker
	 *
	 * @param tracker The tracker to remove
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/runtime/_SafeCls_54.as::removeLinkEventTracker()
    removeLinkEventTracker(tracker: ILinkEventTracker): void;

    /**
	 * Create a link event, routing it to matching trackers
	 *
	 * @param link The link string to route
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/runtime/_SafeCls_54.as::createLinkEvent()
    createLinkEvent(link: string): void;

    /**
	 * The registered trackers, in registration order — `HTMLTextController` walks them to find the
	 * one whose `linkPattern` prefixes a clicked href. `ComponentContext` has always exposed this
	 * getter; only the interface omitted it, so the one caller reaches it through `IWindowContext`,
	 * which declares the same member off `WindowContext.as`.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/runtime/_SafeCls_54.as::get linkEventTrackers()
    readonly linkEventTrackers: readonly ILinkEventTracker[];

    /**
	 * Log an error.
	 *
	 * @returns whether the error was handled by tearing the context down, so callers can stop
	 * whatever they were doing.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/runtime/_SafeCls_54.as::error()
    error(message: string, fatal?: boolean, code?: number, error?: Error): boolean;

    /**
	 * Log a warning
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/runtime/_SafeCls_54.as::warning()
    warning(message: string): void;

    /**
	 * Log a debug message
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/runtime/_SafeCls_54.as::debug()
    debug(message: string): void;
}

/**
 * Update Receiver Interface
 *
 * Based on AS3: com.sulake.core.runtime.IUpdateReceiver
 */
export interface IUpdateReceiver extends IDisposable
{
    /**
	 * Called each frame with delta time
	 */
    update(deltaTime: number): void;
}
