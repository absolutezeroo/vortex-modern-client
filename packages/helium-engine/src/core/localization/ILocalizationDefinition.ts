/**
 * Interface for localization definition (language/region configuration)
 *
 * Based on AS3 com.sulake.core.localization.ILocalizationDefinition
 */
export interface ILocalizationDefinition
{
    /**
	 * Full identifier (e.g., "en_US.UTF-8")
	 */
    readonly id: string;

    /**
	 * Language code (e.g., "en")
	 */
    readonly languageCode: string;

    /**
	 * Country code (e.g., "US")
	 */
    readonly countryCode: string;

    /**
	 * Character encoding (e.g., "UTF-8")
	 */
    readonly encoding: string;

    /**
	 * Display name for this localization
	 */
    readonly name: string;

    /**
	 * URL to load localization data from
	 */
    readonly url: string;
}
