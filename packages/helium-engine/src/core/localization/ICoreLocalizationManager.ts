import type {EventEmitter} from 'eventemitter3';
import type {ILocalizable} from './ILocalizable';
import type {ILocalization} from './ILocalization';
import type {ILocalizationDefinition} from './ILocalizationDefinition';
import type {IGameDataResources} from './IGameDataResources';

/**
 * Events emitted by the localization manager
 *
 * Based on AS3 localization events:
 * - LOCALIZATION_EVENT_LOCALIZATION_LOADED
 * - LOCALIZATION_EVENT_LOCALIZATION_FAILED
 * - "complete" event
 */
export interface LocalizationManagerEvents
{
    loaded: () => void;
    failed: () => void;
    complete: () => void;
}

/**
 * Core localization manager interface
 *
 * Based on AS3 com.sulake.core.localization.ICoreLocalizationManager
 */
export interface ICoreLocalizationManager
{
    /**
	 * Event emitter for localization events
	 */
    readonly events: EventEmitter;

    /**
	 * Register a listener for localization updates
	 */
    registerLocalizationListener(key: string, listener: ILocalizable): boolean;

    /**
	 * Remove a listener for localization updates
	 */
    removeLocalizationListener(key: string, listener: ILocalizable): boolean;

    /**
	 * Load localization data from a URL
	 */
    loadLocalizationFromURL(url: string, environmentId: string, acceptEmpty?: boolean): void;

    /**
	 * Check if a localization key exists
	 */
    hasLocalization(key: string): boolean;

    /**
	 * Get a localized string value
	 */
    getLocalization(key: string, defaultValue?: string): string;

    /**
	 * Get a property value with parameter substitution
	 */
    getProperty(key: string, params?: Record<string, string>): string;

    /**
	 * Update a localization value
	 */
    updateLocalization(key: string, value: string): void;

    /**
	 * Register a parameter for a localization key
	 */
    registerParameter(key: string, paramName: string, paramValue: string, paramId?: string): string;

    /**
	 * Get raw localization object
	 */
    getLocalizationRaw(key: string): ILocalization | null;

    /**
	 * Get all localization keys
	 */
    getKeys(): string[];

    /**
	 * Register a localization definition
	 */
    registerLocalizationDefinition(id: string, name: string, url: string, code: string): void;

    /**
	 * Activate a localization definition
	 */
    activateLocalizationDefinition(id: string): boolean;

    /**
	 * Get all localization definitions
	 */
    getLocalizationDefinitions(): Map<string, ILocalizationDefinition>;

    /**
	 * Get a specific localization definition
	 */
    getLocalizationDefinition(id: string): ILocalizationDefinition | null;

    /**
	 * Get the currently active localization definition
	 */
    getActiveLocalizationDefinition(): ILocalizationDefinition | null;

    /**
	 * Print all non-existing keys that were requested
	 */
    printNonExistingKeys(): void;

    /**
	 * Get game data resources (hashes)
	 */
    getGameDataResources(): IGameDataResources | null;

    /**
	 * Interpolate a string, replacing ${key} with localization values
	 */
    interpolate(value: string): string;
}
