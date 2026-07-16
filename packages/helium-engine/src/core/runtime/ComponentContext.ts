import {getIIDName, type IID} from './IID';
import type {IContext, InterfaceCallback, IUpdateReceiver} from './IContext';
import type {ICoreConfiguration} from './ICoreConfiguration';
import type {ILinkEventTracker} from './events/ILinkEventTracker';
import {Component, ComponentEvents, ComponentFlags} from './Component';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('ComponentContext');

/**
 * Interface queue entry
 */
interface IInterfaceQueue<T = unknown>
{
    iid: IID<T>;
    callbacks: InterfaceCallback<T>[];
}

/**
 * Update receiver entry
 */
interface IUpdateReceiverEntry
{
    receiver: IUpdateReceiver;
    priority: number;
}

/**
 * Component Context
 *
 * Based on AS3: com.sulake.core.runtime.ComponentContext
 *
 * The main container that manages components and their dependencies.
 * Handles interface queuing, component lifecycle, and update distribution.
 *
 * @example
 * ```typescript
 * // Create context
 * const context = new ComponentContext();
 *
 * // Create and attach a component
 * const navigator = new NavigatorManager(context);
 * context.attachComponent(navigator, [IID_Navigator, IID_NewNavigator]);
 *
 * // Other components can now request these interfaces
 * context.queueInterface(IID_Navigator, (iid, nav) => {
 *     console.log('Navigator is ready:', nav);
 * });
 * ```
 */
export class ComponentContext extends Component implements IContext
{
    private readonly _attachedComponents: Component[] = [];
    private readonly _interfaceQueues: Map<symbol, IInterfaceQueue> = new Map();
    private readonly _updateReceivers: IUpdateReceiverEntry[] = [];
    private _updateReceiversDirty: boolean = false;
    private readonly _linkEventTrackers: ILinkEventTracker[] = [];
    private readonly _unlockHandlers: Map<Component, () => void> = new Map();

    constructor(parentContext?: IContext)
    {
        // Pass self as context if no parent, otherwise pass parent
        // Note: We need to construct Component with a valid context
        // For root context, we'll set it up specially
        super(parentContext ?? (null as unknown as IContext), ComponentFlags.CONTEXT);

        // For root context, we are our own context
        if(!parentContext)
        {
            // @ts-expect-error - Accessing private field for root context setup
            this._context = this;
        }
    }

    private _configuration: ICoreConfiguration | null = null;

    /**
	 * Configuration manager
	 */
    get configuration(): ICoreConfiguration | null
    {
        return this._configuration;
    }

    set configuration(value: ICoreConfiguration | null)
    {
        this._configuration = value;
    }

    /**
	 * Get the root context
	 */
    get root(): IContext
    {
        if(!this.context || this.context === this)
        {
            return this;
        }
        return this.context.root;
    }

    /**
	 * Request an interface from this context
	 */
    override queueInterface<T>(iid: IID<T>, callback?: InterfaceCallback<T>): T | null
    {
        // First check if a component provides this interface
        for(const component of this._attachedComponents)
        {
            if(component.disposed || component.locked) continue;

            const interfaces = component.getProvidedInterfaces();

            if(interfaces.includes(iid))
            {
                const instance = component.queueInterface(iid, callback);

                if(instance)
                {
                    return instance;
                }
            }
        }

        // Not found - queue the callback
        if(callback)
        {
            this.addToQueue(iid, callback);

            // If we have a parent context, also queue there
            if(this.context && this.context !== this)
            {
                this.context.queueInterface(iid, (resolvedIid, instance) =>
                {
                    this.announceInterfaceAvailability(resolvedIid, instance);
                });
            }
        }

        return null;
    }

    /**
	 * Attach a component to this context
	 */
    attachComponent(component: Component, interfaces: IID[]): void
    {
        if(this.disposed) return;

        if(this._attachedComponents.includes(component))
        {
            log.warn(`Component ${component} already attached`);

            return;
        }

        // Check if this is a proper Component with registerInterface
        const isProperComponent = typeof component.registerInterface === 'function';

        if(!isProperComponent)
        {
            log.warn('Object does not extend Component, skipping interface registration:', component);
            // Still store it for basic lookup, but can't use full Component features
            return;
        }

        this._attachedComponents.push(component);

        // Register interfaces
        for(const iid of interfaces)
        {
            component.registerInterface(iid, component);
        }

        // Listen for unlock event
        if(component.locked)
        {
            const unlockHandler = () =>
            {
                this._unlockHandlers.delete(component);
                this.onComponentUnlocked(component, interfaces);
            };
            this._unlockHandlers.set(component, unlockHandler);
            component.events.once(ComponentEvents.UNLOCKED, unlockHandler);
        }
        else
        {
            // Component is ready - announce interfaces
            for(const iid of interfaces)
            {
                if(this._interfaceQueues.has(iid))
                {
                    this.announceInterfaceAvailability(iid, component);
                }
            }
        }
    }

    /**
	 * Detach a component from this context
	 */
    detachComponent(component: Component): void
    {
        const index = this._attachedComponents.indexOf(component);

        if(index > -1)
        {
            this._attachedComponents.splice(index, 1);

            const unlockHandler = this._unlockHandlers.get(component);

            if(unlockHandler)
            {
                component.events.off(ComponentEvents.UNLOCKED, unlockHandler);
                this._unlockHandlers.delete(component);
            }
        }
    }

    /**
	 * Register an update receiver
	 */
    registerUpdateReceiver(receiver: IUpdateReceiver, priority: number): void
    {
        // Check if already registered
        const existing = this._updateReceivers.find(e => e.receiver === receiver);

        if(existing)
        {
            existing.priority = priority;
        }
        else
        {
            this._updateReceivers.push({receiver, priority});
        }

        this._updateReceiversDirty = true;
    }

    /**
	 * Remove an update receiver
	 */
    removeUpdateReceiver(receiver: IUpdateReceiver): void
    {
        const index = this._updateReceivers.findIndex(e => e.receiver === receiver);

        if(index > -1)
        {
            this._updateReceivers.splice(index, 1);
        }
    }

    /**
	 * Update all receivers
	 */
    update(deltaTime: number): void
    {
        if(this._updateReceiversDirty)
        {
            this._updateReceivers.sort((a, b) => a.priority - b.priority);
            this._updateReceiversDirty = false;
        }

        for(const entry of this._updateReceivers)
        {
            if(!entry.receiver.disposed)
            {
                try
                {
                    entry.receiver.update(deltaTime);
                }
                catch (e)
                {
                    log.error('Update error:', e);
                }
            }
        }
    }

    /**
	 * Add a link event tracker
	 *
	 * @see source_as_win63/core/runtime/ComponentContext.as lines 509-515
	 */
    addLinkEventTracker(tracker: ILinkEventTracker): void
    {
        if(this._linkEventTrackers.indexOf(tracker) < 0)
        {
            this._linkEventTrackers.push(tracker);
        }
    }

    /**
	 * Remove a link event tracker
	 *
	 * @see source_as_win63/core/runtime/ComponentContext.as lines 517-524
	 */
    removeLinkEventTracker(tracker: ILinkEventTracker): void
    {
        const index = this._linkEventTrackers.indexOf(tracker);

        if(index > -1)
        {
            this._linkEventTrackers.splice(index, 1);
        }
    }

    /**
	 * Create a link event, routing it to all matching trackers
	 *
	 * @see source_as_win63/core/runtime/ComponentContext.as lines 526-536
	 */
    createLinkEvent(link: string): void
    {
        for(const tracker of this._linkEventTrackers)
        {
            if(tracker.linkPattern.length > 0)
            {
                if(link.substring(0, tracker.linkPattern.length) === tracker.linkPattern)
                {
                    tracker.linkReceived(link);
                }
            }
            else
            {
                tracker.linkReceived(link);
            }
        }
    }

    /**
	 * Log an error.
	 *
	 * @returns whether the error was handled by tearing the context down; always false here, only
	 * CoreComponentContext can return true.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/runtime/ComponentContext.as::error()
    error(message: string, fatal: boolean = false, code: number = -1, error?: Error): boolean
    {
        this._lastError = message;

        log.error(`Error: ${message}`, error);

        this.events.emit(ComponentEvents.ERROR, {message, fatal, code, error});

        return false;
    }

    /**
	 * Log a warning
	 */
    warning(message: string): void
    {
        this._lastWarning = message;

        log.warn(message);

        this.events.emit(ComponentEvents.WARNING, message);
    }

    /**
	 * Log a debug message
	 */
    debug(message: string): void
    {
        this._lastDebug = message;

        this.events.emit(ComponentEvents.DEBUG, message);
    }

    /**
	 * Dispose of this context and all attached components
	 */
    override dispose(): void
    {
        if(this.disposed) return;

        // Dispose all attached components
        while(this._attachedComponents.length > 0)
        {
            const component = this._attachedComponents.pop();

            component?.dispose();
        }

        // Clear queues
        this._interfaceQueues.clear();

        // Clear update receivers
        this._updateReceivers.length = 0;

        // Clear link event trackers
        this._linkEventTrackers.length = 0;

        super.dispose();
    }

    /**
	 * Purge all components
	 */
    override purge(): void
    {
        super.purge();

        for(const component of this._attachedComponents)
        {
            if(component !== this)
            {
                component.purge();
            }
        }
    }

    /**
	 * Get all attached components
	 */
    getAttachedComponents(): readonly Component[]
    {
        return this._attachedComponents;
    }

    /**
	 * Add a callback to the interface queue
	 */
    private addToQueue<T>(iid: IID<T>, callback: InterfaceCallback<T>): void
    {
        let queue = (this._interfaceQueues.get(iid) ?? null) as IInterfaceQueue<T> | null;

        if(!queue)
        {
            queue = {
                iid,
                callbacks: [],
            };
            this._interfaceQueues.set(iid, queue as IInterfaceQueue);
        }

        queue.callbacks.push(callback);
    }

    /**
	 * Called when a component unlocks (all its dependencies resolved)
	 */
    private onComponentUnlocked(component: Component, interfaces: IID[]): void
    {
        if(this.disposed || component.disposed) return;

        // Announce all interfaces this component provides
        for(const iid of interfaces)
        {
            if(this._interfaceQueues.has(iid))
            {
                this.announceInterfaceAvailability(iid, component);
            }
        }

        // Notify root context
        this.root.events.emit(ComponentEvents.UNLOCKED, component);
    }

    /**
	 * Announce that an interface is now available
	 */
    private announceInterfaceAvailability<T>(iid: IID<T>, provider: Component | T): void
    {
        const queue = (this._interfaceQueues.get(iid) ?? null) as IInterfaceQueue<T> | null;

        if(!queue) return;

        const callbacks = [...queue.callbacks];
        queue.callbacks.length = 0;

        // Get the actual instance
        const instance = provider instanceof Component
            ? provider.queueInterface(iid)
            : provider;

        if(!instance)
        {
            this.error(`Interface ${getIIDName(iid)} still unavailable!`, false, 6);

            return;
        }

        // Call all queued callbacks
        for(const callback of callbacks)
        {
            try
            {
                callback(iid, instance);
            }
            catch (e)
            {
                log.error('Callback error:', e);
            }
        }

        // Remove empty queue
        if(queue.callbacks.length === 0)
        {
            this._interfaceQueues.delete(iid);
        }
    }
}
