import type {ILocalizationDefinition} from './ILocalizationDefinition';

/**
 * Localization definition for a specific language/region
 *
 * Based on AS3 com.sulake.core.localization.LocalizationDefinition
 */
export class LocalizationDefinition implements ILocalizationDefinition
{
    private readonly _languageCode: string;
    private readonly _countryCode: string;
    private readonly _encoding: string;
    private readonly _name: string;
    private readonly _url: string;

    constructor(code: string, name: string, url: string)
    {
        // Parse code like "en_US.UTF-8"
        const parts = code.split('_');
        this._languageCode = parts[0];

        const subParts = String(parts[1]).split('.');
        this._countryCode = subParts[0];
        this._encoding = subParts[1];

        this._name = name;
        this._url = url;
    }

    get id(): string
    {
        return this._languageCode + '_' + this._countryCode + '.' + this._encoding;
    }

    get languageCode(): string
    {
        return this._languageCode;
    }

    get countryCode(): string
    {
        return this._countryCode;
    }

    get encoding(): string
    {
        return this._encoding;
    }

    get name(): string
    {
        return this._name;
    }

    get url(): string
    {
        return this._url;
    }
}
