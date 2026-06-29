/**
 * Interface for a localization entry
 *
 * Based on AS3 com.sulake.core.localization.ILocalization
 */
export interface ILocalization
{
	/**
	 * Whether this localization has been initialized with a value
	 */
	readonly isInitialized: boolean;

	/**
	 * Get the processed value with parameters filled in
	 */
	readonly value: string;

	/**
	 * Get the raw value without parameter processing
	 */
	readonly raw: string;
}
