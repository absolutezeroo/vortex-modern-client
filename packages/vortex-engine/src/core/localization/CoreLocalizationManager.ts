import {Component, type IContext} from '@core/runtime';
import {Logger} from '@core/utils/Logger';
import type {ICoreLocalizationManager} from './ICoreLocalizationManager';
import type {ILocalizable} from './ILocalizable';
import type {ILocalization} from './ILocalization';
import type {ILocalizationDefinition} from './ILocalizationDefinition';
import type {IGameDataResources} from './IGameDataResources';
import {Localization} from './Localization';
import {LocalizationDefinition} from './LocalizationDefinition';
import {GameDataResources} from './GameDataResources';
import {LocalizationEvent} from './LocalizationEvent';

const log = Logger.getLogger('Localization');

/**
 * Core localization manager
 * Manages localized text with support for:
 * - Key-value storage
 * - Parameter substitution (%param% syntax)
 * - Interpolation (${key} syntax)
 * - Listener notifications
 * - Loading from external files
 *
 */
export class CoreLocalizationManager extends Component implements ICoreLocalizationManager 
{
    private static readonly INTERPOLATION_DEPTH_LIMIT = 3;

    protected _localizations: Map<string, Localization> = new Map();
    protected _definitions: Map<string, LocalizationDefinition> = new Map();
    protected _acceptEmptyMap: Map<string, boolean> = new Map();
    protected _nonExistingKeys: string[] = [];
    protected _activeDefinitionId: string = '';
    protected _activeEnvironmentId: string = '';
    protected _gameDataResources: GameDataResources | null = null;

    constructor(context: IContext, flags: number = 0) 
    {
        super(context, flags);
    }

    public registerLocalizationDefinition(id: string, name: string, url: string, code: string): void 
    {
        if(!this._definitions.has(id)) 
        {
            const definition = new LocalizationDefinition(code, name, url);
            this._definitions.set(id, definition);
        }
    }

    /**
	 * Activates a registered localization and loads its texts.
	 *
	 * A definition's `url` is the **hashes index**, not the texts themselves —
	 * `localization.N.url` points at `gamedata/hashes`, whose `external_texts`
	 * entry names the real, content-hashed file
	 * (`gamedata/external_flash_texts/<hash>`). So this hands the URL to
	 * loadLocalizationFromURL(), which resolves the index and then fetches what it
	 * points to, exactly as AS3 does.
	 *
	 * It used to call loadExternalTexts(definition.url) directly, feeding the
	 * hashes index to the texts parser. Nothing threw: the parse simply produced no
	 * entries, so every key resolved to getLocalization()'s empty-string default.
	 * That is why furniture names were blank in the catalog and the inventory while
	 * the infostand showed them — the infostand reads furnitureData.localizedName
	 * from furnidata and never touches localization at all.
	 *
	 * @param id - The registered definition's name
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/localization/CoreLocalizationManager.as::activateLocalizationDefinition()
    public activateLocalizationDefinition(id: string): boolean
    {
        const definition = this._definitions.get(id);

        if(definition)
        {
            this._activeDefinitionId = id;

            // No _activeEnvironmentId assignment here: loadLocalizationFromURL() sets it
            // from the argument, which is what AS3 passes languageCode along for.
            this.loadLocalizationFromURL(definition.url, definition.languageCode);

            return true;
        }

        return false;
    }

    public getLocalizationDefinitions(): Map<string, ILocalizationDefinition> 
    {
        return this._definitions;
    }

    public getLocalizationDefinition(id: string): ILocalizationDefinition | null 
    {
        return this._definitions.get(id) ?? null;
    }

    public getActiveLocalizationDefinition(): ILocalizationDefinition | null 
    {
        return this.getLocalizationDefinition(this._activeDefinitionId);
    }

    public getActiveEnvironmentId(): string 
    {
        return this._activeEnvironmentId;
    }

    /**
     * Load localization from hashes URL (AS3 flow)
     * First loads hashes.json, then loads external_texts from constructed URL
     */
    // AS3: sources/win63_version/core/localization/CoreLocalizationManager.as::loadLocalizationFromURL()
    public loadLocalizationFromURL(hashesUrl: string, environmentId: string, acceptEmpty: boolean = false): void 
    {
        if(!hashesUrl || hashesUrl === '') 
        {
            log.warn('Localization hashes URL was null or empty!');

            this.events.emit(LocalizationEvent.LOCALIZATION_FAILED);

            return;
        }

        this._activeEnvironmentId = environmentId;

        fetch(hashesUrl)
            .then((response) => 
            {
                if(!response.ok) 
                {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return response.text();
            })
            .then((text) => 
            {
                try 
                {
                    const resources = GameDataResources.parse(text);

                    if(!resources.isValid()) 
                    {
                        log.error('Hashes file incomplete');

                        this.events.emit(LocalizationEvent.LOCALIZATION_FAILED);

                        return;
                    }

                    this._gameDataResources = resources;

                    // Construct final URL: url + "/" + hash
                    const externalTextsUrl = resources.externalTextsUrl;
                    const externalTextsHash = resources.externalTextsHash;

                    if(!externalTextsUrl || !externalTextsHash) 
                    {
                        log.error('No external_texts entry in hashes file');

                        this.events.emit(LocalizationEvent.LOCALIZATION_FAILED);

                        return;
                    }

                    this.loadExternalTextUrls([`${externalTextsUrl}/${externalTextsHash}`], acceptEmpty);
                }
                catch (error) 
                {
                    log.error(`Failed parsing hashes: ${error}`);

                    this.events.emit(LocalizationEvent.LOCALIZATION_FAILED);
                }
            })
            .catch((error) => 
            {
                log.error(`Failed to load hashes: ${error.message}`);

                this.events.emit(LocalizationEvent.LOCALIZATION_FAILED);
            });
    }

    /**
     * Load external texts directly from URL (for definitions)
     */
    public loadExternalTexts(url: string, acceptEmpty: boolean = false): void 
    {
        this.loadExternalTextUrls([url], acceptEmpty);
    }

    public hasLocalization(key: string): boolean 
    {
        return this._localizations.has(key);
    }

    public getLocalization(key: string, defaultValue: string = ''): string 
    {
        const localization = this._localizations.get(key);

        if(!localization) 
        {
            this._nonExistingKeys.push(key);
            return defaultValue;
        }

        return localization.value;
    }

    public getProperty(key: string, params?: Record<string, string>): string 
    {
        let value = this.getLocalization(key);

        if(params) 
        {
            for(const [paramKey, paramValue] of Object.entries(params)) 
            {
                value = value.replace(new RegExp(`%${paramKey}%`, 'g'), paramValue);
            }
        }

        return value;
    }

    public updateLocalization(key: string, value: string): void 
    {
        let localization = this._localizations.get(key);

        if(!localization) 
        {
            localization = new Localization(this, key, value);

            this._localizations.set(key, localization);
        }
        else 
        {
            localization.setValue(value);
        }
    }

    public registerLocalizationListener(key: string, listener: ILocalizable): boolean 
    {
        let localization = this._localizations.get(key);

        if(!localization) 
        {
            this._nonExistingKeys.push(key);

            localization = new Localization(this, key, key);

            this._localizations.set(key, localization);
        }

        localization.registerListener(listener);
        return true;
    }

    public removeLocalizationListener(key: string, listener: ILocalizable): boolean 
    {
        const localization = this._localizations.get(key);

        if(localization) 
        {
            localization.removeListener(listener);
        }

        return true;
    }

    public registerParameter(key: string, paramName: string, paramValue: string, paramId: string = '%'): string 
    {
        let localization = this._localizations.get(key);

        if(!localization) 
        {
            localization = new Localization(this, key, key);

            this._localizations.set(key, localization);
        }

        localization.registerParameter(paramName, paramValue, paramId);

        return localization.value;
    }

    public getLocalizationRaw(key: string): ILocalization | null 
    {
        return this._localizations.get(key) ?? null;
    }

    public getKeys(): string[] 
    {
        return Array.from(this._localizations.keys());
    }

    public printNonExistingKeys(): void 
    {
        if(this._nonExistingKeys.length > 0) 
        {
            log.warn('Non-existing localization keys:');

            for(const key of this._nonExistingKeys) 
            {
                log.warn(`  - ${key}`);
            }
        }
    }

    public getGameDataResources(): IGameDataResources | null 
    {
        return this._gameDataResources;
    }

    public override interpolate(value: string): string
    {
        if(!value) 
        {
            return value;
        }

        const regex = /\$\{([^}]*)\}/g;
        let result = value;

        for(let depth = 0; depth < CoreLocalizationManager.INTERPOLATION_DEPTH_LIMIT; depth++) 
        {
            const match = regex.exec(result);

            if(match === null) 
            {
                return result;
            }

            let replacements = 0;

            for(let i = 1; i < match.length; i++) 
            {
                const localization = this._localizations.get(match[i]);

                if(localization) 
                {
                    replacements++;
                    result = result.replace('${' + match[i] + '}', localization.value);
                }
            }

            if(replacements === 0) 
            {
                break;
            }

            // Reset regex lastIndex for next iteration
            regex.lastIndex = 0;
        }

        // AS3 falls through here (loop exhausted or broke out with unresolved ${...}
        // tokens the localization dictionary didn't have) to the configuration's own
        // interpolate() for one more pass - e.g. config-only tokens. The no-match early
        // return above stays as-is (AS3 returns the string as-is there too, never
        // reaching super.interpolate()).
        return super.interpolate(result);
    }

    protected override initComponent(): void 
    {
        log.debug('CoreLocalizationManager initialized');
    }

    // AS3: sources/win63_version/core/localization/CoreLocalizationManager.as::parseLocalizationData()
    protected parseLocalizationData(data: string): Map<string, string> 
    {
        if(!data) 
        {
            return new Map();
        }

        const result = new Map<string, string>();
        const trimmedData = data.trim();

        // Detect JSON format (starts with { or [)
        if(trimmedData.startsWith('{') || trimmedData.startsWith('[')) 
        {
            return this.parseJsonLocalizationData(trimmedData, result);
        }

        // Parse key=value format (old Habbo format)
        return this.parseKeyValueLocalizationData(data, result);
    }

    protected updateAllListeners(): void 
    {
        for(const localization of this._localizations.values()) 
        {
            localization.updateListeners();
        }
    }

    private loadExternalTextUrls(urls: string[], acceptEmpty: boolean = false): void 
    {
        if(urls.length === 0) 
        {
            this.events.emit(LocalizationEvent.LOCALIZATION_FAILED);
            return;
        }

        for(const url of urls) 
        {
            this._acceptEmptyMap.set(url, acceptEmpty);
        }

        Promise.all(urls.map(async (url) => 
        {
            const response = await fetch(url);

            if(!response.ok) 
            {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return response.text();
        }))
            .then((texts) => 
            {
                for(const text of texts) 
                {
                    if(!this.validateLocalizationData(text, acceptEmpty)) 
                    {
                        log.error('Invalid localization data received');

                        this.events.emit(LocalizationEvent.LOCALIZATION_FAILED);

                        return;
                    }

                    this.parseLocalizationData(text);
                }

                this.events.emit(LocalizationEvent.LOCALIZATION_LOADED);
            })
            .catch((error) => 
            {
                const err = error instanceof Error ? error : new Error(String(error));

                log.error(`Failed to load localization: ${err.message}`);

                this.events.emit(LocalizationEvent.LOCALIZATION_FAILED);
            });
    }

    /**
     * Parse JSON format localization data (Nitro format)
     */
    private parseJsonLocalizationData(data: string, result: Map<string, string>): Map<string, string> 
    {
        try 
        {
            const json = JSON.parse(data);

            for(const [key, value] of Object.entries(json)) 
            {
                if(typeof value === 'string') 
                {
                    this.updateLocalization(key, value);

                    result.set(key, value);
                }
            }

            log.debug(`Parsed ${result.size} localization entries from JSON`);
        }
        catch (error) 
        {
            log.error(`Failed to parse JSON localization data: ${error}`);
        }

        this.updateAllListeners();

        return result;
    }

    /**
     * Parse key=value format localization data (original Habbo format)
     */
    private parseKeyValueLocalizationData(data: string, result: Map<string, string>): Map<string, string> 
    {
        const lineRegex = /\n\r{1,}|\n{1,}|\r{1,}/gm;
        const trimRegex = /^\s+|\s+$/g;
        const newlineRegex = /\\n/gm;
        const lines = data.split(lineRegex);

        for(const line of lines) 
        {
            // Skip comments
            if(line.charAt(0) === '#') 
            {
                continue;
            }

            const parts = line.split('=');

            if(parts[0].length === 0) 
            {
                continue;
            }

            if(parts.length > 1) 
            {
                let key = parts.shift()!;
                let value = parts.join('=');

                key = key.replace(trimRegex, '');
                value = value.replace(trimRegex, '');
                value = value.replace(newlineRegex, '\n');

                if(value.length > 0) 
                {
                    this.updateLocalization(key, value);

                    result.set(key, value);
                }
            }
        }

        log.debug(`Parsed ${result.size} localization entries from key=value format`);

        this.updateAllListeners();

        return result;
    }

    private validateLocalizationData(data: string, acceptEmpty: boolean): boolean 
    {
        if(data === null || data === undefined) 
        {
            return false;
        }

        if(data.length === 0 && !acceptEmpty) 
        {
            return false;
        }

        // Check if we received HTML instead of localization data
        if(data.indexOf('<!DOCTYPE html') !== -1)
        {
            return false;
        }

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/localization/CoreLocalizationManager.as::dispose()
    public override dispose(): void
    {
        if(this.disposed) return;

        this._localizations.clear();
        this._definitions.clear();
        this._nonExistingKeys = [];
        this._acceptEmptyMap.clear();

        super.dispose();
    }
}
