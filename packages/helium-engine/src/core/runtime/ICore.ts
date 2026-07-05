import type {EventEmitter} from 'eventemitter3';
import type {IContext} from './IContext';
import type {ICoreConfiguration} from './ICoreConfiguration';
import type {ICoreErrorLogger} from './ICoreErrorLogger';
import type {IFileProxy} from './IFileProxy';

/**
 * Core Interface
 *
 * The top-level core runtime interface. Extends IContext (component management,
 * update loop, events) and ICoreConfiguration (property access).
 *
 * Provides initialization, hibernation, purge, reboot, profiler mode,
 * library loading, and file proxy storage.
 *
 * @see sources/win63_version/core/runtime/ICore.as
 * @see sources/win63_version/core/runtime/CoreComponentContext.as
 */
export interface ICore extends IContext, ICoreConfiguration
{
    /**
	 * Core arguments dictionary.
	 */
    readonly arguments: Map<string, unknown>;

    /**
	 * File proxy for persistent storage.
	 *
	 * @see CoreComponentContext.as (get/set fileProxy)
	 */
    fileProxy: IFileProxy | null;

    /**
	 * Initialize the core. Waits for all locked components to unlock,
	 * then dispatches COMPONENT_EVENT_RUNNING.
	 */
    initialize(): void;

    /**
	 * Check if any attached components are still locked.
	 *
	 * @see CoreComponentContext.as lines 199-208
	 */
    hasLockedComponents(): boolean;

    /**
	 * Purge cached data across all components.
	 */
    purge(): void;

    /**
	 * Enter hibernation mode. Updates at a reduced frequency.
	 *
	 * @param priority - Maximum priority level to still update (0-2)
	 * @param updateFrequency - Updates per second during hibernation (default 1)
	 */
    hibernate(priority: number, updateFrequency?: number): void;

    /**
	 * Resume from hibernation.
	 */
    resume(): void;

    /**
	 * Get the number of libraries still loading.
	 */
    getNumberOfFilesPending(): number;

    /**
	 * Get the number of libraries that have loaded.
	 */
    getNumberOfFilesLoaded(): number;

    /**
	 * Enable or disable profiler mode.
	 */
    setProfilerMode(enabled: boolean): void;

    /**
	 * Clear core arguments.
	 */
    clearArguments(): void;

    /**
	 * Set the external error logger.
	 */
    set errorLogger(logger: ICoreErrorLogger | null);

    /**
	 * Trigger a core reboot on the next frame.
	 */
    reboot(): void;

    /**
	 * Read a config document and set up library loading.
	 *
	 * @param config - Configuration object describing libraries to load
	 * @param eventDelegate - Optional EventEmitter for progress/complete events
	 */
    readConfigDocument(config: Record<string, unknown>, eventDelegate?: EventEmitter): void;

    /**
	 * Dispatch loading progress for an individual file.
	 */
    updateLoadingProgress(fileName: string, bytesLoaded: number, bytesTotal: number, elapsedTime: number): void;

    /**
	 * Handle library loading completion.
	 */
    updateLoadingProcess(fileName?: string, status?: 'complete' | 'error'): void;

    /**
	 * Handle a library loading error.
	 */
    errorInLoadingProcess(url: string, httpStatus: number, bytesLoaded: number, bytesTotal: number, errorMsg: string): void;

    /**
	 * Read a string from the file proxy.
	 */
    readStringFromProxy(key: string): string | null;

    /**
	 * Write a string to the file proxy.
	 */
    writeStringToProxy(key: string, value: string): boolean;

    /**
	 * Write a dictionary/object to the file proxy (JSON serialized).
	 */
    writeDictionaryToProxy(key: string, data: Record<string, unknown>): boolean;

    /**
	 * Read a dictionary/object from the file proxy (JSON deserialized).
	 */
    readDictionaryFromProxy(key: string): Record<string, unknown> | null;

    /**
	 * Write an XML string to the file proxy.
	 */
    writeXMLToProxy(key: string, xml: string): boolean;

    /**
	 * Read an XML string from the file proxy.
	 */
    readXMLFromProxy(key: string): string | null;
}
