import {EventEmitter} from 'eventemitter3';
import {getIIDName, type IID} from './IID';
import type {IDisposable} from './IDisposable';
import type {IContext, InterfaceCallback, IUpdateReceiver} from './IContext';
import type {ComponentDependency} from './ComponentDependency';
import type {AssetLoaderStruct, IAsset, IAssetLibrary} from '@core/assets';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('Component');

/**
 * Helper to check if an object has an `events` property that is an EventEmitter
 */
function hasEvents(obj: unknown): obj is { events: EventEmitter }
{
	return obj !== null && typeof obj === 'object' && 'events' in obj && typeof (obj as {
		events: unknown
	}).events === 'object';
}

/**
 * Helper to check if an object has a `release` method
 */
function hasRelease(obj: unknown): obj is { release: (iid: IID) => void }
{
	return obj !== null && typeof obj === 'object' && 'release' in obj && typeof (obj as {
		release: unknown
	}).release === 'function';
}

/**
 * Component Events
 */
export const ComponentEvents = {
	RUNNING: 'component:running',
	DISPOSING: 'component:disposing',
	UNLOCKED: 'component:unlocked',
	ERROR: 'component:error',
	WARNING: 'component:warning',
	DEBUG: 'component:debug',
} as const;

/**
 * Component Flags
 */
export const ComponentFlags = {
	NULL: 0,
	INTERFACE: 1,
	CONTEXT: 2,
	DISPOSABLE: 4,
} as const;

/**
 * Interface struct for tracking provided interfaces
 */
interface InterfaceStruct<T = unknown>
{
	iid: IID<T>;
	instance: unknown;
	references: number;
}

/**
 * Component
 *
 * Based on AS3: com.sulake.core.runtime.Component
 *
 * Base class for all managers and services. Provides:
 * - Dependency injection via `dependencies` getter
 * - Lifecycle management (init, dispose)
 * - Lock/unlock mechanism for async dependency resolution
 * - Event emission
 *
 * @example
 * ```typescript
 * class NavigatorManager extends Component
 * {
 *     private _communicationManager: ICommunicationManager | null = null;
 *     private _configurationManager: IConfigurationManager | null = null;
 *
 *     protected get dependencies(): ComponentDependency[]
 *     {
 *         return [
 *             new ComponentDependency(
 *                 IID_CommunicationManager,
 *                 (m) => this._communicationManager = m,
 *                 true
 *             ),
 *             new ComponentDependency(
 *                 IID_ConfigurationManager,
 *                 (m) => this._configurationManager = m,
 *                 true
 *             ),
 *         ];
 *     }
 *
 *     protected initComponent(): void
 *     {
 *         // All dependencies are now available
 *         this._communicationManager!.addMessageEvent(...);
 *     }
 * }
 * ```
 */
export class Component implements IDisposable
{
	protected _lastError: string = '';
	protected _lastWarning: string = '';
	protected _lastDebug: string = '';
	private readonly _context: IContext;
	private readonly _events: EventEmitter;
	private readonly _interfaces: Map<symbol, InterfaceStruct> = new Map();
	private readonly _cleanupFunctions: Array<() => void> = [];
	private _requiredDependenciesCount: number = 1; // Start at 1, decremented after all deps queued
	private _pendingDependencies: Set<string> = new Set();
	private _constructionComplete: boolean = false;

	constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
	{
		this._context = context;
		this._flags = flags;
		this._events = new EventEmitter();
		this._assets = assetLibrary;

		// Allow null context for ComponentContext (CONTEXT flag), which sets itself as context after super()
		if (!this._context && !(flags & ComponentFlags.CONTEXT))
		{
			throw new Error(`[Component] IContext not provided to ${this.constructor.name}`);
		}

		// Get dependencies and set up injection
		const deps = this.dependencies;

		if (deps.length > 0)
		{
			this.lock();
		}

		// Queue all dependencies
		for (const dep of deps)
		{
			if (dep.required)
			{
				this._requiredDependenciesCount++;
				this._pendingDependencies.add(getIIDName(dep.identifier));
			}

			this.injectDependency(dep);
		}

		// All dependencies have been queued
		this.onAllDependenciesQueued();

		// Mark construction as complete (subclass field initializers have NOT run yet, but will before microtask)
		this._constructionComplete = true;
	}

	private _assets: IAssetLibrary | null = null;

	/**
	 * The asset library for this component
	 */
	get assets(): IAssetLibrary | null
	{
		return this._assets;
	}

	protected _flags: number = 0;

	/**
	 * Component flags
	 */
	get flags(): number
	{
		return this._flags;
	}

	protected _disposed: boolean = false;

	/**
	 * Whether the component has been disposed
	 */
	get disposed(): boolean
	{
		return this._disposed;
	}

	private _locked: boolean = false;

	/**
	 * Whether the component is locked (waiting for dependencies)
	 */
	get locked(): boolean
	{
		return this._locked;
	}

	/**
	 * The context this component belongs to
	 */
	get context(): IContext
	{
		return this._context;
	}

	/**
	 * Event emitter for this component
	 */
	get events(): EventEmitter
	{
		return this._events;
	}

	/**
	 * Override this to declare component dependencies.
	 * Called during construction.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- variance: typed ComponentDependency<T> is contravariant in T
	protected get dependencies(): Array<ComponentDependency<any>>
	{
		return [];
	}

	/**
	 * Whether all required dependencies have been injected
	 */
	protected get allRequiredDependenciesInjected(): boolean
	{
		return this._requiredDependenciesCount === 0;
	}

	/**
	 * Find an asset by name
	 */
	findAssetByName(name: string): IAsset | null
	{
		return this._assets?.getAssetByName(name) ?? null;
	}

	/**
	 * Remove an asset
	 */
	removeAsset(asset: IAsset): IAsset | null
	{
		return this._assets?.removeAsset(asset) ?? null;
	}

	/**
	 * Load an asset from a file URL
	 */
	loadAssetFromFile(name: string, url: string, mimeType?: string, id: number = -1): AssetLoaderStruct | null
	{
		return this._assets?.loadAssetFromFile(name, url, mimeType, id) ?? null;
	}

	/**
	 * Check if an asset exists
	 */
	hasAsset(name: string): boolean
	{
		return this._assets?.hasAsset(name) ?? false;
	}

	/**
	 * Dispose of this component
	 */
	dispose(): void
	{
		if (this._disposed) return;

		// Run cleanup functions
		for (const cleanup of this._cleanupFunctions)
		{
			try
			{
				cleanup();
			}
			catch (e)
			{
				log.error('[Component] Cleanup error:', e);
			}
		}
		this._cleanupFunctions.length = 0;

		// Emit disposing event
		this._events.emit(ComponentEvents.DISPOSING);

		// Clear interfaces
		this._interfaces.clear();

		// Clear events
		this._events.removeAllListeners();

		// Dispose assets
		if (this._assets)
		{
			this._assets.dispose();
			this._assets = null;
		}

		this._disposed = true;
	}

	/**
	 * Purge cached data (override in subclass if needed)
	 */
	purge(): void
	{
		// Override in subclass
	}

	/**
	 * Request an interface from the context
	 */
	queueInterface<T>(iid: IID<T>, callback?: InterfaceCallback<T>): T | null
	{
		// Check if we provide this interface ourselves
		const struct = this._interfaces.get(iid);

		if (struct)
		{
			if (this._disposed)
			{
				throw new Error(`[Component] Cannot queue interface on disposed component: ${this.constructor.name}`);
			}

			if (this._locked)
			{
				return null;
			}

			struct.references++;
			const instance = struct.instance as T;

			if (callback)
			{
				callback(iid, instance);
			}

			return instance;
		}

		// Delegate to context
		return this._context.queueInterface(iid, callback);
	}

	/**
	 * Release a reference to an interface
	 */
	release(iid: IID): number
	{
		if (this._disposed) return 0;

		const struct = this._interfaces.get(iid);

		if (!struct)
		{
			throw new Error(`[Component] Attempting to release unknown interface: ${getIIDName(iid)}`);
		}

		struct.references--;

		// Auto-dispose if disposable flag set and no more references
		if ((this._flags & ComponentFlags.DISPOSABLE) && struct.references === 0)
		{
			const totalRefs = Array.from(this._interfaces.values())
				.reduce((sum, s) => sum + s.references, 0);

			if (totalRefs === 0)
			{
				this._context.detachComponent(this);
				this.dispose();
			}
		}

		return struct.references;
	}

	/**
	 * Register an interface that this component provides
	 */
	registerInterface<T>(iid: IID<T>, instance: T): void
	{
		this._interfaces.set(iid, {
			iid,
			instance,
			references: 0,
		});
	}

	/**
	 * Get all interfaces this component provides
	 */
	getProvidedInterfaces(): IID[]
	{
		return Array.from(this._interfaces.keys());
	}

	/**
	 * Check if a configuration property exists
	 */
	propertyExists(key: string): boolean
	{
		return this._context.configuration?.propertyExists(key) ?? false;
	}

	/**
	 * Get a configuration property
	 */
	getProperty(key: string, params?: Record<string, string>): string
	{
		return this._context.configuration?.getProperty(key, params) ?? '';
	}

	/**
	 * Set a configuration property
	 */
	setProperty(key: string, value: string, persistent?: boolean, log?: boolean): void
	{
		this._context.configuration?.setProperty(key, value, persistent, log);
	}

	/**
	 * Get a boolean configuration property
	 */
	getBoolean(key: string): boolean
	{
		return this._context.configuration?.getBoolean(key) ?? false;
	}

	/**
	 * Get an integer configuration property
	 */
	getInteger(key: string, defaultValue: number): number
	{
		return this._context.configuration?.getInteger(key, defaultValue) ?? defaultValue;
	}

	/**
	 * Register this component to receive updates
	 */
	registerUpdateReceiver(receiver: IUpdateReceiver, priority: number): void
	{
		if(!this._disposed)
		{
			this._context.registerUpdateReceiver(receiver, priority);
		}
	}

	/**
	 * Remove this component from update receivers
	 */
	removeUpdateReceiver(receiver: IUpdateReceiver): void
	{
		if(!this._disposed)
		{
			this._context.removeUpdateReceiver(receiver);
		}
	}

	/**
	 * String representation
	 */
	toString(): string
	{
		return `[Component ${this.constructor.name}]`;
	}

	/**
	 * Called when all required dependencies have been injected.
	 * Override this to perform initialization that requires dependencies.
	 */
	protected initComponent(): void
	{
		// Override in subclass
	}

	/**
	 * Lock the component (waiting for dependencies)
	 */
	protected lock(): void
	{
		if (!this._locked)
		{
			this._locked = true;
		}
	}

	/**
	 * Unlock the component (all dependencies resolved)
	 */
	protected unlock(): void
	{
		if (this._locked)
		{
			this._locked = false;

			this._events.emit(ComponentEvents.UNLOCKED, this);
		}
	}

	/**
	 * Inject a single dependency
	 */
	private injectDependency(dep: ComponentDependency): void
	{
		const callback = this.createDependencyCallback(dep);

		this.queueInterface(dep.identifier, callback);
	}

	/**
	 * Create a callback for when a dependency is resolved
	 */
	private createDependencyCallback<T>(dep: ComponentDependency<T>): InterfaceCallback<T>
	{
		return (iid: IID<T>, instance: T) =>
		{
			// If called during construction (before field initializers run),
			// defer to a microtask. Otherwise field initializers will overwrite
			// the value we set here.
			if (!this._constructionComplete)
			{
				queueMicrotask(() => this.applyDependency(dep, iid, instance));
				return;
			}

			this.applyDependency(dep, iid, instance);
		};
	}

	/**
	 * Apply a resolved dependency
	 */
	private applyDependency<T>(dep: ComponentDependency<T>, iid: IID<T>, instance: T): void
	{
		if (this._disposed) return;

		// Call setter
		if (dep.setter)
		{
			dep.setter(instance);
		}

		// Attach event listeners
		if (dep.eventListeners && hasEvents(instance))
		{
			for (const listener of dep.eventListeners)
			{
				instance.events.on(listener.type, listener.callback);
			}
		}

		// Create cleanup function
		this._cleanupFunctions.push(
			this.createCleanupFunction(dep, instance)
		);

		// Track required dependency resolution
		if (dep.required)
		{
			const iidName = getIIDName(dep.identifier);
			this._pendingDependencies.delete(iidName);
			this.onAllDependenciesQueued(iidName);
		}
	}

	/**
	 * Create a cleanup function for a dependency
	 */
	private createCleanupFunction<T>(dep: ComponentDependency<T>, instance: T): () => void
	{
		return () =>
		{
			// Remove event listeners
			if (dep.eventListeners && hasEvents(instance))
			{
				for (const listener of dep.eventListeners)
				{
					instance.events.off(listener.type, listener.callback);
				}
			}

			// Clear setter
			if (dep.setter)
			{
				dep.setter(null);
			}

			// Release interface
			if (hasRelease(instance))
			{
				instance.release(dep.identifier);
			}
		};
	}

	/**
	 * Called when all dependencies have been queued or when a required dependency resolves
	 * @param resolvedIidName Name of the resolved dependency (for debugging)
	 */
	private onAllDependenciesQueued(resolvedIidName: string = ''): void
	{
		this._requiredDependenciesCount--;

		if (this._requiredDependenciesCount === 0)
		{
			// If construction isn't complete yet, defer initComponent to allow
			// subclass field initializers to complete. In JS/TS, field initializers
			// run AFTER the parent constructor, so we must wait.
			// Note: Dependencies can resolve synchronously during constructor if the
			// provider is already available, which is why we check _constructionComplete.
			if (!this._constructionComplete)
			{
				queueMicrotask(() =>
				{
					if (this._disposed) return;

					try
					{
						this.initComponent();
						this.unlock();
					}
					catch (e)
					{
						log.error(`[Component] Error in initComponent for ${this.constructor.name}:`, e);
						throw e;
					}
				});
			}
			else
			{
				// Construction is complete - fields are initialized, call synchronously
				try
				{
					this.initComponent();

					this.unlock();
				}
				catch (e)
				{
					log.error(`[Component] Error in initComponent for ${this.constructor.name}:`, e);
					throw e;
				}
			}
		}
	}
}
