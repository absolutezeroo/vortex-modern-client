/**
 * Core Configuration Interface
 *
 * Based on AS3: com.sulake.core.runtime.ICoreConfiguration
 *
 * Base interface for configuration management with property storage,
 * interpolation, and URL protocol handling.
 */
export interface ICoreConfiguration
{
	/**
	 * Check if a property exists
	 */
	propertyExists(key: string): boolean;

	/**
	 * Get a string property value
	 * @param key Property key
	 * @param params Optional parameters for %param% replacement
	 */
	getProperty(key: string, params?: Record<string, string>): string;

	/**
	 * Set a property value
	 * @param key Property key
	 * @param value Property value
	 * @param persistent If true, cannot be overwritten by non-persistent sets
	 * @param log If true, log when setting new properties
	 */
	setProperty(key: string, value: string, persistent?: boolean, log?: boolean): void;

	/**
	 * Get a boolean property value
	 * Returns true if value is "1" or "true"
	 */
	getBoolean(key: string): boolean;

	/**
	 * Get an integer property value
	 * @param key Property key
	 * @param defaultValue Default value if key doesn't exist or is not a number
	 */
	getInteger(key: string, defaultValue: number): number;

	/**
	 * Interpolate a string, replacing ${key} with property values
	 * Supports up to 3 levels of nesting
	 */
	interpolate(value: string): string;

	/**
	 * Update URL protocol (HTTP to HTTPS if configured)
	 */
	updateUrlProtocol(url: string): string;
}
