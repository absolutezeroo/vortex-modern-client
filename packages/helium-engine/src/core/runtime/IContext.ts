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
 * Context Interface
 *
 * Based on AS3: com.sulake.core.runtime.IContext
 *
 * The Context is the central container that manages components and their
 * dependencies. It handles:
 * - Component registration and lifecycle
 * - Dependency resolution via queueInterface
 * - Event propagation between components
 */
export interface IContext extends IDisposable
{
    /**
	 * Event emitter for context-level events
	 */
    readonly events: EventEmitter;

    /**
	 * Root context (top of the hierarchy)
	 */
    readonly root: IContext;

    /**
	 * Configuration manager
	 */
    configuration: ICoreConfiguration | null;

    /**
	 * Asset library for this context
	 */
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
    attachComponent(component: Component, interfaces: IID[]): void;

    /**
	 * Detach a component from this context
	 *
	 * @param component The component to detach
	 */
    detachComponent(component: Component): void;

    /**
	 * Register an update receiver to be called each frame
	 *
	 * @param receiver Object with update method
	 * @param priority Update priority (lower = earlier)
	 */
    registerUpdateReceiver(receiver: IUpdateReceiver, priority: number): void;

    /**
	 * Remove an update receiver
	 */
    removeUpdateReceiver(receiver: IUpdateReceiver): void;

    /**
	 * Add a link event tracker
	 *
	 * @param tracker The tracker to add
	 */
    addLinkEventTracker(tracker: ILinkEventTracker): void;

    /**
	 * Remove a link event tracker
	 *
	 * @param tracker The tracker to remove
	 */
    removeLinkEventTracker(tracker: ILinkEventTracker): void;

    /**
	 * Create a link event, routing it to matching trackers
	 *
	 * @param link The link string to route
	 */
    createLinkEvent(link: string): void;

    /**
	 * Log an error.
	 *
	 * @returns whether the error was handled by tearing the context down, so callers can stop
	 * whatever they were doing.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/runtime/IContext.as::error()
    error(message: string, fatal?: boolean, code?: number, error?: Error): boolean;

    /**
	 * Log a warning
	 */
    warning(message: string): void;

    /**
	 * Log a debug message
	 */
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
