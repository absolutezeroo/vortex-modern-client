import type {IContext} from '@core/runtime';
import {Logger} from '@core/utils/Logger';
import {Core} from '@core/Core';
import {CoreLocalizationManager} from '@core/localization';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboLocalizationManager} from './IHabboLocalizationManager';
import {BadgeBaseAndLevel} from './BadgeBaseAndLevel';
import {HabboCommunicationEvent, type HabboCommunicationEventType} from '@habbo/communication/enum';
import {HabboConfigurationFlags} from '@habbo/configuration/enum/HabboConfigurationFlags';

const log = Logger.getLogger('HabboLocalization');

/**
 * Habbo-specific localization manager
 * Extends core localization with badge, achievement, and Habbo-specific features
 *
 * Based on AS3 com.sulake.habbo.localization.HabboLocalizationManager
 */
export class HabboLocalizationManager extends CoreLocalizationManager implements IHabboLocalizationManager
{
    private static readonly ROMAN_NUMERALS: string[] = [
        'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
        'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
        'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX',
    ];

    private _isLocalizationInitialized: boolean = false;
    private _badgePointLimits: Map<string, number> = new Map();
    private _configurationManager: IHabboConfigurationManager | null = null;
    private _communicationManager: IHabboCommunicationManager | null = null;
    private _skipExternals: boolean = false;
    private _boundOnLoginStep: ((step: HabboCommunicationEventType) => void) | null = null;

    // AS3: sources/win63_version/habbo/localization/HabboLocalizationManager.as constructor
    constructor(context: IContext, flags: number = 0)
    {
        super(context, flags);

        this._skipExternals = (flags & HabboConfigurationFlags.SKIP_EXTERNAL_VARIABLES) > 0;
    }

    /**
	 * Set the configuration manager reference
	 */
    setConfigurationManager(configManager: IHabboConfigurationManager): void
    {
        this._configurationManager = configManager;

        this.configureLocalizationLocations();
    }

    /**
	 * Set the communication manager reference
	 */
    setCommunicationManager(commManager: IHabboCommunicationManager): void
    {
        this._communicationManager = commManager;

        if(this._skipExternals)
        {
            this.events.emit('complete');
        }
        else
        {
            // Listen for AUTHENTICATED event to trigger localization loading
            this._boundOnLoginStep = (step: HabboCommunicationEventType) =>
            {
                if(step === HabboCommunicationEvent.AUTHENTICATED)
                {
                    this.onAuthenticated();
                }
            };
            this._communicationManager.events.on('loginStep', this._boundOnLoginStep);
        }
    }

    loadDefaultEmbedLocalizations(language: string, fallback: boolean = true): boolean
    {
        // In TypeScript version, embedded localizations would be imported modules
        // For now, we log and return false as external loading is preferred
        log.info(`Loading default localizations for language: ${language}`);

        if(fallback && language !== 'en')
        {
            log.info('Trying with default language: en');
            return this.loadDefaultEmbedLocalizations('en', false);
        }

        return false;
    }

    getLocalizationWithParams(key: string, defaultValue: string = '', ...params: string[]): string
    {
        if(params && params.length > 0)
        {
            for(let i = 0; i < params.length / 2; i++)
            {
                this.registerParameter(key, params[i * 2], params[i * 2 + 1]);
            }
        }

        return this.getLocalization(key, defaultValue);
    }

    getLocalizationWithParamMap(key: string, defaultValue: string = '', paramMap?: Map<string, string>): string
    {
        if(paramMap)
        {
            for(const [paramKey, paramValue] of paramMap)
            {
                this.registerParameter(key, paramKey, paramValue);
            }
        }

        return this.getLocalization(key, defaultValue);
    }

    // AS3: sources/win63_version/habbo/localization/HabboLocalizationManager.as::getExternalVariablesUrl()
    getExternalVariablesUrl(): string
    {
        return this.getGameDataResources()?.externalVariablesUrl ?? '';
    }

    // AS3: sources/win63_version/habbo/localization/HabboLocalizationManager.as::getExternalVariablesHash()
    getExternalVariablesHash(): string
    {
        return this.getGameDataResources()?.externalVariablesHash ?? '';
    }

    override getActiveEnvironmentId(): string
    {
        return super.getActiveEnvironmentId();
    }

    override getLocalization(key: string, defaultValue: string = ''): string
    {
        const localization = super.getLocalization(key, defaultValue);
        return this.interpolate(localization);
    }

    getAchievementName(badgeId: string): string
    {
        const badgeInfo = new BadgeBaseAndLevel(badgeId);

        const localizationKey = this.getExistingKey([
            'badge_name_al_' + badgeId,
            'badge_name_al_' + badgeInfo.base,
            'badge_name_' + badgeId,
            'badge_name_' + badgeInfo.base,
        ]);

        this.registerParameter(localizationKey, 'roman', this.getRomanNumeral(badgeInfo.level));

        const localization = this.getLocalization(localizationKey);
        return localization ?? '';
    }

    getAchievementDesc(badgeId: string, limit: number): string
    {
        const badgeInfo = new BadgeBaseAndLevel(badgeId);

        const localizationKey = this.getExistingKey([
            'badge_desc_al_' + badgeId,
            'badge_desc_al_' + badgeInfo.base,
            'badge_desc_' + badgeId,
            'badge_desc_' + badgeInfo.base,
        ]);

        this.registerParameter(localizationKey, 'limit', '' + limit);
        this.registerParameter(localizationKey, 'roman', this.getRomanNumeral(badgeInfo.level));

        return this.getLocalization(localizationKey);
    }

    getAchievementInstruction(badgeId: string): string
    {
        const badgeInfo = new BadgeBaseAndLevel(badgeId);

        const localizationKey = this.getExistingKey(['badge_instruction_' + badgeInfo.base]);

        this.registerParameter(localizationKey, 'limit', '' + this.getBadgePointLimit(badgeId));

        const localization = this.getLocalization(localizationKey);
        return localization ?? '';
    }

    getBadgeBaseName(badgeId: string): string
    {
        const badgeInfo = new BadgeBaseAndLevel(badgeId);
        return badgeInfo.base;
    }

    getBadgeName(badgeId: string): string
    {
        const badgeInfo = new BadgeBaseAndLevel(badgeId);

        const localizationKey = this.fixBadLocalization(
            this.getExistingKey(['badge_name_' + badgeId, 'badge_name_' + badgeInfo.base])
        );

        this.registerParameter(localizationKey, 'roman', this.getRomanNumeral(badgeInfo.level));

        return this.getLocalization(localizationKey);
    }

    getBadgeDesc(badgeId: string): string
    {
        const badgeInfo = new BadgeBaseAndLevel(badgeId);

        const localizationKey = this.fixBadLocalization(
            this.getExistingKey(['badge_desc_' + badgeId, 'badge_desc_' + badgeInfo.base])
        );

        this.registerParameter(localizationKey, 'limit', '' + this.getBadgePointLimit(badgeId));
        this.registerParameter(localizationKey, 'roman', this.getRomanNumeral(badgeInfo.level));

        const localization = this.getLocalization(localizationKey);
        return localizationKey === localization ? '' : localization;
    }

    getPreviousLevelBadgeId(badgeId: string): string
    {
        const badgeInfo = new BadgeBaseAndLevel(badgeId);
        badgeInfo.level--;
        return badgeInfo.badgeId;
    }

    setBadgePointLimit(badgeId: string, limit: number): void
    {
        this._badgePointLimits.set(badgeId, limit);
    }

    // AS3: sources/win63_version/habbo/localization/HabboLocalizationManager.as::requestLocalizationInit()
    requestLocalizationInit(): void
    {
        if(this._isLocalizationInitialized)
        {
            return;
        }

        if(!this._configurationManager)
        {
            log.error('Configuration manager not set');
            return;
        }

        this._isLocalizationInitialized = true;

        this.events.once('loaded', () =>
        {
            this._isLocalizationInitialized = false;
            log.success('Localizations ready');

            this.events.emit('complete');
        });

        this.events.once('failed', () =>
        {
            this._isLocalizationInitialized = false;
            Core.crash('Failed loading gamedata hashes', 8);
        });

        const hashesUrl = this._configurationManager.getProperty('gamedata.hashes.url');
        const environmentId = this._configurationManager.getProperty('environment.id');

        super.loadLocalizationFromURL(hashesUrl, environmentId);
    }

    protected override initComponent(): void
    {
        super.initComponent();

        log.debug('HabboLocalizationManager initialized');
    }

    /**
	 * Called when authentication is complete
	 * Based on AS3:
	 * ```
	 * private function onAuthenticated(event: Event): void {
	 *     requestLocalizationInit();
	 * }
	 * ```
	 */
    private onAuthenticated(): void
    {
        this.requestLocalizationInit();
    }

    private configureLocalizationLocations(): void
    {
        if(!this._configurationManager)
        {
            return;
        }

        let index = 1;

        while(this._configurationManager.propertyExists('localization.' + index))
        {
            const localizationName = this._configurationManager.getProperty('localization.' + index);
            const localizationCode = this._configurationManager.getProperty('localization.' + index + '.code');
            const localizationDisplayName = this._configurationManager.getProperty('localization.' + index + '.name');
            const localizationUrl = this._configurationManager.getProperty('localization.' + index + '.url');

            super.registerLocalizationDefinition(localizationName, localizationDisplayName, localizationUrl, localizationCode);

            index++;
        }
    }

    private getBadgePointLimit(badgeId: string): number
    {
        return this._badgePointLimits.get(badgeId) ?? 0;
    }

    private getExistingKey(keys: string[]): string
    {
        for(const candidateKey of keys)
        {
            const value = this.getLocalization(candidateKey);
            if(value !== '')
            {
                return candidateKey;
            }
        }

        return keys[0];
    }

    private getRomanNumeral(level: number): string
    {
        return HabboLocalizationManager.ROMAN_NUMERALS[Math.max(0, level - 1)] ?? '';
    }

    private fixBadLocalization(localizationKey: string): string
    {
        let fixedKey = localizationKey.replace('${', '$');

        fixedKey = fixedKey.replace('{', '$');

        return fixedKey.replace('}', '$');
    }
}
