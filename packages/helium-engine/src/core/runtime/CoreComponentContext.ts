import type {EventEmitter} from 'eventemitter3';
import type {IUpdateReceiver} from './IContext';
import type {ICore} from './ICore';
import type {ICoreErrorReporter} from './ICoreErrorReporter';
import type {ICoreErrorLogger} from './ICoreErrorLogger';
import type {IFileProxy} from './IFileProxy';
import {ComponentContext} from './ComponentContext';
import {ComponentEvents} from './Component';
import {DefaultErrorReporter} from './DefaultErrorReporter';
import {LibraryProgressEvent} from './events/LibraryProgressEvent';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('CoreComponentContext');

/**
 * Number of update receiver priority levels.
 *
 * Level 0 = highest priority (always runs)
 * Level 1 = can skip frames if behind
 * Level 2 = lowest priority (most frame skipping)
 */
const NUM_UPDATE_RECEIVER_LEVELS = 3;

/**
 * Core setup constants — determines which frame update handler is used.
 *
 * @see sources/win63_version/core/class_79.as
 */
export const CoreSetup =
{
	/** Simple update loop — iterates all receivers every frame */
	FRAME_UPDATE_SIMPLE: 0,

	/** Complex update loop — time-sliced, skips lower priority when behind */
	FRAME_UPDATE_COMPLEX: 1,

	/** Profiler update loop — wraps updates with profiler timing */
	FRAME_UPDATE_PROFILER: 2,

	/** Experimental update loop — per-receiver frame skipping via UpdateDelegate */
	FRAME_UPDATE_EXPERIMENT: 4,

	/** Bitmask for extracting frame update mode from setup flags */
	FRAME_UPDATE_MASK: 15,

	/** Debug mode — all features enabled */
	DEBUG: 15,
} as const;

/**
 * Core Component Context
 *
 * The top-level runtime context. Extends ComponentContext with:
 * - 3-tier priority update loop (simple, complex, experimental, debug modes)
 * - Hibernation system (reduced update frequency)
 * - Reboot mechanism
 * - Error reporting delegation
 * - Library loading pipeline (adapted for fetch-based web loading)
 * - File proxy for persistent storage
 *
 * In AS3 this was the root context created by Core.instantiate().
 *
 * @see sources/win63_version/core/runtime/CoreComponentContext.as
 */
export class CoreComponentContext extends ComponentContext implements ICore
{
	/** Static file proxy instance (AS3: var_1203) */
	private static _fileProxy: IFileProxy | null = null;

	/** Update receivers organized by priority level */
	private _updateReceiversByPriority: (IUpdateReceiver | null)[][] = [];

	/** Frame skip counters per priority level */
	private _frameSkipCounters: number[] = [];

	/** The active frame update handler function */
	private _frameUpdateHandler: (timeMs: number, deltaMs: number) => void;

	/** Error reporter */
	private _errorReporter: ICoreErrorReporter;

	/** Timestamp of the last update */
	private _lastUpdateTimeMs: number = 0;

	/** Core setup flags */
	private _setupFlags: number = 0;

	/** Hibernation priority level (-1 = not hibernating) */
	private _hibernationLevel: number = -1;

	/** Hibernation update frequency in ms */
	private _hibernationUpdateFrequency: number = 0;

	/** Whether to reboot on next frame */
	private _rebootOnNextFrame: boolean = false;

	/** Core arguments */
	private _arguments: Map<string, unknown> = new Map();

	/** Number of files in config */
	private _numberOfFilesInConfig: number = 0;

	/** Number of files still pending */
	private _filesPending: number = 0;

	/** Target FPS for frame budget calculation */
	private _targetFps: number = 60;

	/**
	 * Loading event delegate — receives progress/complete events during library loading.
	 *
	 * AS3: _loadingEventDelegate: IEventDispatcher
	 * In web: an EventEmitter to dispatch LibraryProgressEvent and "complete" events.
	 *
	 * @see CoreComponentContext.as line 44
	 */
	private _loadingEventDelegate: EventEmitter | null = null;

	constructor(
		errorReporter?: ICoreErrorReporter,
		setupFlags: number = CoreSetup.FRAME_UPDATE_SIMPLE,
		args?: Map<string, unknown>
	)
	{
		super();

		this._errorReporter = errorReporter ?? new DefaultErrorReporter();
		this._setupFlags = setupFlags;
		this._arguments = args ?? new Map();

		// Initialize priority-level receiver arrays
		for(let i = 0; i < NUM_UPDATE_RECEIVER_LEVELS; i++)
		{
			this._updateReceiversByPriority.push([]);
			this._frameSkipCounters.push(0);
		}

		this._lastUpdateTimeMs = performance.now();

		// Select frame update handler based on setup flags
		const mode = setupFlags & CoreSetup.FRAME_UPDATE_MASK;

		switch(mode)
		{
			case CoreSetup.FRAME_UPDATE_SIMPLE:
				log.debug('Core: using simple frame update handler');
				this._frameUpdateHandler = this.simpleFrameUpdateHandler.bind(this);
				break;
			case CoreSetup.FRAME_UPDATE_COMPLEX:
				log.debug('Core: using complex frame update handler');
				this._frameUpdateHandler = this.complexFrameUpdateHandler.bind(this);
				break;
			case CoreSetup.FRAME_UPDATE_EXPERIMENT:
				log.debug('Core: using experimental frame update handler');
				this._frameUpdateHandler = this.experimentalFrameUpdateHandler.bind(this);
				break;
			case CoreSetup.DEBUG:
				log.debug('Core: using debug frame update handler');
				this._frameUpdateHandler = this.debugFrameUpdateHandler.bind(this);
				break;
			default:
				log.debug('Core: using simple frame update handler (default)');
				this._frameUpdateHandler = this.simpleFrameUpdateHandler.bind(this);
		}
	}

	/**
	 * Set the target FPS for frame budget calculations.
	 */
	set targetFps(fps: number)
	{
		this._targetFps = fps;
	}

	get targetFps(): number
	{
		return this._targetFps;
	}

	get arguments(): Map<string, unknown>
	{
		return this._arguments;
	}

	set errorLogger(logger: ICoreErrorLogger | null)
	{
		if(this._errorReporter)
		{
			this._errorReporter.errorLogger = logger;
		}
	}

	/**
	 * Get the file proxy for persistent storage.
	 *
	 * @see CoreComponentContext.as line 159 (get fileProxy)
	 */
	get fileProxy(): IFileProxy | null
	{
		return CoreComponentContext._fileProxy;
	}

	/**
	 * Set the file proxy for persistent storage.
	 *
	 * @see CoreComponentContext.as line 155 (set fileProxy)
	 */
	set fileProxy(proxy: IFileProxy | null)
	{
		CoreComponentContext._fileProxy = proxy;
	}

	/**
	 * Initialize the core. Waits for all locked components, then starts.
	 *
	 * @see CoreComponentContext.as lines 179-208
	 */
	initialize(): void
	{
		if(this.hasLockedComponents())
		{
			const handler = () =>
			{
				if(!this.hasLockedComponents())
				{
					this.events.off(ComponentEvents.UNLOCKED, handler);
					this.doInitialize();
				}
			};
			this.events.on(ComponentEvents.UNLOCKED, handler);
		}
		else
		{
			this.doInitialize();
		}
	}

	/**
	 * Check if any attached components are still locked.
	 *
	 * @see CoreComponentContext.as lines 199-208
	 */
	hasLockedComponents(): boolean
	{
		for(const component of this.getAttachedComponents())
		{
			if(component.locked)
			{
				return true;
			}
		}

		return false;
	}

	clearArguments(): void
	{
		this._arguments = new Map();
	}

	getNumberOfFilesPending(): number
	{
		return this._filesPending;
	}

	getNumberOfFilesLoaded(): number
	{
		return this._numberOfFilesInConfig - this._filesPending;
	}

	/**
	 * Enter hibernation mode.
	 *
	 * During hibernation, only update receivers up to the given priority level
	 * are updated, and at a reduced frequency.
	 *
	 * @param priority - Max priority level to update (0-2)
	 * @param updateFrequency - Updates per second (default 1)
	 *
	 * @see CoreComponentContext.as lines 443-449
	 */
	hibernate(priority: number, updateFrequency: number = 1): void
	{
		if(!this.hibernating)
		{
			this._hibernationLevel = priority;
			this._hibernationUpdateFrequency = 1000 / updateFrequency;
			log.debug(`Core: entering hibernation (priority=${priority}, freq=${updateFrequency}fps)`);
		}
	}

	/**
	 * Resume from hibernation.
	 *
	 * @see CoreComponentContext.as lines 451-456
	 */
	resume(): void
	{
		if(this.hibernating)
		{
			this._hibernationLevel = -1;
			log.debug('Core: resuming from hibernation');
		}
	}

	setProfilerMode(_enabled: boolean): void
	{
		// Profiler mode is not applicable in the web version.
		// The browser DevTools serve this purpose.
		log.debug('Core: profiler mode not supported in web version, use browser DevTools');
	}

	/**
	 * Trigger a reboot on the next frame.
	 *
	 * @see CoreComponentContext.as lines 707-709
	 */
	reboot(): void
	{
		this._rebootOnNextFrame = true;
	}

	/**
	 * Read a config document and set up library loading.
	 *
	 * In AS3, this parsed XML config with asset/service/component library
	 * nodes and created LibraryLoader instances for each SWF.
	 *
	 * In the web version, this sets up the loading pipeline for
	 * asset files and notifies progress via the loading event delegate.
	 *
	 * @param config - Configuration object describing libraries to load
	 * @param eventDelegate - Optional EventEmitter to receive progress/complete events
	 *
	 * @see CoreComponentContext.as lines 257-285
	 */
	readConfigDocument(config: Record<string, unknown>, eventDelegate?: EventEmitter): void
	{
		log.debug('Parsing config document');

		this._loadingEventDelegate = eventDelegate ?? null;

		// In AS3, this parsed XML for asset-libraries, service-libraries,
		// component-libraries. In the web version, libraries are ES modules
		// loaded at build time. This method is kept for API compatibility
		// and to support dynamic asset loading if needed.

		const assetLibraries = config['asset-libraries'] as string[] | undefined;
		const serviceLibraries = config['service-libraries'] as string[] | undefined;
		const componentLibraries = config['component-libraries'] as string[] | undefined;

		const allUrls: string[] = [
			...(assetLibraries ?? []),
			...(serviceLibraries ?? []),
			...(componentLibraries ?? []),
		];

		this._numberOfFilesInConfig += allUrls.length;
		this._filesPending += allUrls.length;

		if(!this.disposed)
		{
			this.updateLoadingProcess();
		}
	}

	/**
	 * Dispatch loading progress for an individual file.
	 *
	 * @param fileName - The file/URL being loaded
	 * @param bytesLoaded - Bytes loaded so far
	 * @param bytesTotal - Total bytes to load
	 * @param elapsedTime - Time elapsed since load started
	 *
	 * @see CoreComponentContext.as lines 371-377 (updateLoadingProgress)
	 */
	updateLoadingProgress(fileName: string, bytesLoaded: number, bytesTotal: number, elapsedTime: number): void
	{
		if(this._loadingEventDelegate !== null)
		{
			this._loadingEventDelegate.emit('progress', new LibraryProgressEvent(
				fileName, bytesLoaded, bytesTotal, elapsedTime
			));
		}
	}

	/**
	 * Handle library loading completion/progress.
	 *
	 * Dispatches progress events and checks if all libraries are loaded.
	 * When all libraries are done, calls finalizeLoadingEventDelegate().
	 *
	 * @param fileName - Optional file that completed (null for initial check)
	 * @param status - 'complete' or 'error'
	 *
	 * @see CoreComponentContext.as lines 379-404 (updateLoadingProcess)
	 */
	updateLoadingProcess(fileName?: string, status?: 'complete' | 'error'): void
	{
		if(fileName)
		{
			if(this._filesPending > 0)
			{
				this._filesPending--;
			}

			log.debug(`Loading library "${fileName}" ${status === 'complete' ? 'ready' : 'failed'}`);

			if(!this.disposed && this._loadingEventDelegate !== null)
			{
				this._loadingEventDelegate.emit('progress', new LibraryProgressEvent(
					fileName,
					this._numberOfFilesInConfig - this._filesPending,
					this._numberOfFilesInConfig,
					0
				));
			}
		}

		if(!this.disposed)
		{
			if(this._filesPending === 0)
			{
				this.finalizeLoadingEventDelegate();
				log.debug('All libraries loaded');
			}
		}
	}

	/**
	 * Handle an error during library loading.
	 *
	 * @param url - The URL that failed
	 * @param httpStatus - HTTP status code
	 * @param bytesLoaded - Bytes loaded before failure
	 * @param bytesTotal - Total bytes expected
	 * @param errorMsg - Error message
	 *
	 * @see CoreComponentContext.as lines 356-362 (errorInLoadingProcess)
	 */
	errorInLoadingProcess(url: string, httpStatus: number, bytesLoaded: number, bytesTotal: number, errorMsg: string): void
	{
		this.error(
			`Failed to download library "${url}" HTTP status ${httpStatus} bytes loaded ${bytesLoaded}/${bytesTotal} : ${errorMsg}`,
			true,
			2
		);

		if(!this.disposed)
		{
			this.updateLoadingProcess(url, 'error');
		}
	}

	/**
	 * Read a string value from the file proxy.
	 *
	 * @param key - Storage key
	 * @returns The string value, or null if not found
	 *
	 * @see CoreComponentContext.as lines 319-336 (readStringFromProxy)
	 */
	readStringFromProxy(key: string): string | null
	{
		try
		{
			const proxy = CoreComponentContext._fileProxy;

			if(proxy)
			{
				return proxy.readCache(key);
			}

			return null;
		}
		catch(e)
		{
			log.error(`Caught error when reading string (${key}) from IFileProxy: ${e}`);
			return null;
		}
	}

	/**
	 * Write a string value to the file proxy.
	 *
	 * @param key - Storage key
	 * @param value - String value to store
	 * @returns True if successful
	 *
	 * @see CoreComponentContext.as lines 338-354 (writeStringToProxy)
	 */
	writeStringToProxy(key: string, value: string): boolean
	{
		try
		{
			const proxy = CoreComponentContext._fileProxy;

			if(proxy)
			{
				proxy.writeCache(key, value);
				return true;
			}

			return false;
		}
		catch(e)
		{
			log.error(`Caught error when writing string (${key}) to IFileProxy: ${e}`);
			return false;
		}
	}

	/**
	 * Write a dictionary/object to the file proxy as JSON.
	 *
	 * AS3: writeDictionaryToProxy wraps writeObjectToProxy with ByteArray.writeObject().
	 * Web: we serialize to JSON.
	 *
	 * @param key - Storage key
	 * @param data - Data to store
	 * @returns True if successful
	 *
	 * @see CoreComponentContext.as lines 303-305 (writeDictionaryToProxy)
	 */
	writeDictionaryToProxy(key: string, data: Record<string, unknown>): boolean
	{
		try
		{
			return this.writeStringToProxy(key, JSON.stringify(data));
		}
		catch(e)
		{
			log.error(`Caught error when writing Dictionary (${key}) to IFileProxy: ${e}`);
			return false;
		}
	}

	/**
	 * Read a dictionary/object from the file proxy (JSON deserialized).
	 *
	 * @param key - Storage key
	 * @returns The deserialized object, or null if not found
	 *
	 * @see CoreComponentContext.as lines 307-309 (readDictionaryFromProxy)
	 */
	readDictionaryFromProxy(key: string): Record<string, unknown> | null
	{
		try
		{
			const str = this.readStringFromProxy(key);

			if(str)
			{
				return JSON.parse(str) as Record<string, unknown>;
			}

			return null;
		}
		catch(e)
		{
			log.error(`Caught error when reading Dictionary (${key}) from IFileProxy: ${e}`);
			return null;
		}
	}

	/**
	 * Write an XML string to the file proxy.
	 *
	 * @param key - Storage key
	 * @param xml - XML string to store
	 * @returns True if successful
	 *
	 * @see CoreComponentContext.as lines 311-313 (writeXMLToProxy)
	 */
	writeXMLToProxy(key: string, xml: string): boolean
	{
		return this.writeStringToProxy(key, xml);
	}

	/**
	 * Read an XML string from the file proxy.
	 *
	 * @param key - Storage key
	 * @returns The XML string, or null if not found
	 *
	 * @see CoreComponentContext.as lines 315-317 (readXMLFromProxy)
	 */
	readXMLFromProxy(key: string): string | null
	{
		return this.readStringFromProxy(key);
	}

	propertyExists(key: string): boolean
	{
		return this.configuration?.propertyExists(key) ?? false;
	}

	getProperty(key: string, params?: Record<string, string>): string
	{
		return this.configuration?.getProperty(key, params) ?? '';
	}

	setProperty(key: string, value: string, persistent?: boolean, log?: boolean): void
	{
		this.configuration?.setProperty(key, value, persistent, log);
	}

	getBoolean(key: string): boolean
	{
		return this.configuration?.getBoolean(key) ?? false;
	}

	getInteger(key: string, defaultValue: number): number
	{
		return this.configuration?.getInteger(key, defaultValue) ?? defaultValue;
	}

	interpolate(value: string): string
	{
		return this.configuration?.interpolate(value) ?? value;
	}

	updateUrlProtocol(url: string): string
	{
		return this.configuration?.updateUrlProtocol(url) ?? url;
	}

	/**
	 * Register an update receiver at the given priority level (0-2).
	 *
	 * Clamps priority to [0, NUM_UPDATE_RECEIVER_LEVELS - 1].
	 * Removes receiver from any existing level first.
	 *
	 * @see CoreComponentContext.as lines 406-415
	 */
	override registerUpdateReceiver(receiver: IUpdateReceiver, priority: number): void
	{
		if(this.disposed)
		{
			return;
		}

		// Remove from any existing level first
		this.removeUpdateReceiver(receiver);

		// Clamp priority
		priority = Math.max(0, Math.min(priority, NUM_UPDATE_RECEIVER_LEVELS - 1));

		const receivers = this._updateReceiversByPriority[priority];

		if(!receivers)
		{
			return;
		}

		receivers.push(receiver);
	}

	/**
	 * Remove an update receiver from all priority levels.
	 *
	 * @see CoreComponentContext.as lines 417-441
	 */
	override removeUpdateReceiver(receiver: IUpdateReceiver): void
	{
		if(this.disposed) return;

		for(let level = 0; level < NUM_UPDATE_RECEIVER_LEVELS; level++)
		{
			const receivers = this._updateReceiversByPriority[level];

			if(!receivers)
			{
				continue;
			}

			const index = receivers.indexOf(receiver);

			if(index > -1)
			{
				receivers[index] = null;
				return;
			}
		}
	}

	/**
	 * Main update method. Called each frame by the PixiJS ticker.
	 *
	 * Handles reboot, hibernation throttling, and delegates to the
	 * active frame update handler.
	 *
	 * @see CoreComponentContext.as lines 466-479 (onEnterFrame)
	 */
	override update(deltaTime: number): void
	{
		if(this.disposed) return;

		// Handle reboot
		if(this._rebootOnNextFrame)
		{
			this._rebootOnNextFrame = false;
			this.events.emit(CoreComponentContextEvents.REBOOT);
			return;
		}

		const now = performance.now();
		const elapsed = now - this._lastUpdateTimeMs;

		// Hibernation throttling
		if(this.hibernating && elapsed < this._hibernationUpdateFrequency)
		{
			return;
		}

		this._frameUpdateHandler(now, elapsed);
		this._lastUpdateTimeMs = now;
	}

	/**
	 * Report an error. Delegates to the error reporter.
	 * Critical errors (except code 2015) trigger disposal.
	 *
	 * @see CoreComponentContext.as lines 247-255
	 */
	override error(message: string, fatal: boolean = false, code: number = -1, error?: Error): void
	{
		super.error(message, fatal, code, error);

		this._errorReporter.logError(message, fatal, code, error);

		if(fatal && code !== 2015)
		{
			this.dispose();
		}
	}

	/**
	 * Dispose the core context and all update receivers.
	 *
	 * @see CoreComponentContext.as lines 210-245
	 */
	override dispose(): void
	{
		if(this.disposed) return;

		log.debug('Disposing core');

		try
		{
			for(let level = 0; level < NUM_UPDATE_RECEIVER_LEVELS; level++)
			{
				const receivers = this._updateReceiversByPriority[level];
				receivers.length = 0;
			}
		}
		catch(e)
		{
			log.error('Error disposing update receivers:', e);
		}

		this._loadingEventDelegate = null;

		super.dispose();

		this._updateReceiversByPriority.length = 0;
		this._frameSkipCounters.length = 0;
	}

	private get hibernating(): boolean
	{
		return this._hibernationLevel > -1;
	}

	/**
	 * Max priority to process (limited during hibernation).
	 */
	private get maxPriority(): number
	{
		return this.hibernating ? this._hibernationLevel + 1 : NUM_UPDATE_RECEIVER_LEVELS;
	}

	/**
	 * Complete initialization after all components are unlocked.
	 */
	private doInitialize(): void
	{
		this.events.emit(CoreComponentContextEvents.RUNNING);
		log.info('Core is now running');
	}

	/**
	 * Finalize the loading event delegate by emitting "complete".
	 *
	 * @see CoreComponentContext.as lines 364-369 (finalizeLoadingEventDelegate)
	 */
	private finalizeLoadingEventDelegate(): void
	{
		if(this._loadingEventDelegate !== null)
		{
			this._loadingEventDelegate.emit('complete');
			this._loadingEventDelegate = null;
		}
	}

	/**
	 * Simple frame update handler.
	 *
	 * @see CoreComponentContext.as lines 481-516
	 */
	private simpleFrameUpdateHandler(_timeMs: number, deltaMs: number): void
	{
		for(let level = 0; level < this.maxPriority; level++)
		{
			this._frameSkipCounters[level] = 0;

			const receivers = this._updateReceiversByPriority[level];
			let i = 0;
			let len = receivers.length;

			while(i < len)
			{
				const receiver = receivers[i];

				if(receiver === null || receiver.disposed)
				{
					receivers.splice(i, 1);
					len--;
				}
				else
				{
					try
					{
						receiver.update(deltaMs);
					}
					catch(e)
					{
						log.error(`Error in update receiver: ${e}`);
						this.error(
							`Error in update receiver: ${(e as Error).message}`,
							true,
							-1,
							e as Error
						);
						return;
					}
					i++;
				}
			}
		}
	}

	/**
	 * Complex frame update handler.
	 *
	 * @see CoreComponentContext.as lines 518-561
	 */
	private complexFrameUpdateHandler(timeMs: number, deltaMs: number): void
	{
		const frameBudget = 1000 / this._targetFps;
		let ok = true;

		for(let level = 0; level < this.maxPriority; level++)
		{
			const elapsed = performance.now() - timeMs;
			let skip = false;

			if(elapsed > frameBudget)
			{
				if(this._frameSkipCounters[level] < level)
				{
					this._frameSkipCounters[level]++;
					skip = true;
				}
			}

			if(!skip)
			{
				this._frameSkipCounters[level] = 0;

				const receivers = this._updateReceiversByPriority[level];
				let i = 0;
				let len = receivers.length;

				while(i < len && ok)
				{
					const receiver = receivers[i];

					if(receiver === null || receiver.disposed)
					{
						receivers.splice(i, 1);
						len--;
					}
					else
					{
						try
						{
							receiver.update(deltaMs);
						}
						catch(e)
						{
							log.error(`Error in update receiver: ${e}`);
							this.error(
								`Error in update receiver: ${(e as Error).message}`,
								true,
								-1,
								e as Error
							);
							ok = false;
						}
						i++;
					}
				}
			}
		}
	}

	/**
	 * Experimental frame update handler.
	 *
	 * @see CoreComponentContext.as lines 601-617
	 */
	private experimentalFrameUpdateHandler(_timeMs: number, _deltaMs: number): void
	{
		for(let level = 0; level < NUM_UPDATE_RECEIVER_LEVELS; level++)
		{
			const receivers = this._updateReceiversByPriority[level];

			for(let i = receivers.length - 1; i >= 0; i--)
			{
				const receiver = receivers[i];

				if(receiver === null || receiver.disposed)
				{
					receivers.splice(i, 1);
				}
			}
		}
	}

	/**
	 * Debug frame update handler.
	 *
	 * @see CoreComponentContext.as lines 619-643
	 */
	private debugFrameUpdateHandler(_timeMs: number, deltaMs: number): void
	{
		for(let level = 0; level < this.maxPriority; level++)
		{
			this._frameSkipCounters[level] = 0;

			const receivers = this._updateReceiversByPriority[level];
			let i = 0;
			let len = receivers.length;

			while(i < len)
			{
				const receiver = receivers[i];

				if(receiver === null || receiver.disposed)
				{
					receivers.splice(i, 1);
					len--;
				}
				else
				{
					// No try/catch — errors propagate for debugging
					receiver.update(deltaMs);
					i++;
				}
			}
		}
	}
}

/**
 * Core component context event constants.
 */
export const CoreComponentContextEvents =
{
	/** Emitted when all components are unlocked and core is running */
	RUNNING: 'COMPONENT_EVENT_RUNNING',

	/** Emitted when core is about to reboot */
	REBOOT: 'COMPONENT_EVENT_REBOOT',
} as const;
