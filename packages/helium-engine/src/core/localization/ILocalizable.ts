/**
 * Interface for objects that can receive localized text updates
 *
 * Based on AS3 com.sulake.core.localization.ILocalizable
 */
export interface ILocalizable
{
	/**
	 * Set the localized text value
	 */
	set localization(value: string);
}
