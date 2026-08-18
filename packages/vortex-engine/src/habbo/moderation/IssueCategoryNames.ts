/**
 * IssueCategoryNames — the English fallback names for a CFH's source and topic.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/IssueCategoryNames.as
 *
 * `getCategoryName()` prefers `help.cfh.topic.<n>` from localization and only falls back to the
 * hard-coded table when that key is absent or empty — the table exists so a hotel that has not
 * translated a topic still shows something. `getSourceName()` has no localization path at all.
 *
 * The manager injects the localization manager through `setLocalizationManager()` as its
 * `IIDHabboLocalizationManager` dependency resolves; until then every topic reads from the table.
 */
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import {StringUtil} from '@habbo/utils/StringUtil';

export class IssueCategoryNames
{
    /** Derived name — `_SafeStr_4683`. Static, so it outlives any one `ModerationManager`. */
    // AS3: IssueCategoryNames.as::_SafeStr_4683
    private static _localizationManager: IHabboLocalizationManager | null = null;

    // AS3: IssueCategoryNames.as::setLocalizationManager()
    public static setLocalizationManager(manager: IHabboLocalizationManager | null): void
    {
        IssueCategoryNames._localizationManager = manager;
    }

    /**
     * AS3 switches on `source - 1`, and **case 12 is missing** — source 13 falls through to
     * "Unknown" while 14 and 15 are named. The gap is in the source and is kept.
     */
    // AS3: IssueCategoryNames.as::getSourceName()
    public static getSourceName(source: number): string
    {
        switch(source - 1)
        {
            case 0:
            case 1:
                return 'Normal';
            case 2:
                return 'Automatic';
            case 3:
                return 'Automatic IM';
            case 4:
                return 'Guide System';
            case 5:
                return 'IM';
            case 6:
                return 'Room';
            case 7:
                return 'Panic';
            case 8:
                return 'Guardian';
            case 9:
                return 'Automatic Helper';
            case 10:
                return 'Discussion';
            case 11:
                return 'Selfie';
            case 13:
                return 'Photo';
            case 14:
                return 'Ambassador';
            default:
                return 'Unknown';
        }
    }

    /** Several topic ids share a name across bands (101/111/121/132 are all "Sex") — as in AS3. */
    // AS3: IssueCategoryNames.as::getCategoryName()
    public static getCategoryName(category: number): string
    {
        const localized = IssueCategoryNames._localizationManager?.getLocalization(
            `help.cfh.topic.${category}`
        ) ?? null;

        if(localized !== null && !StringUtil.isEmpty(localized)) return localized;

        switch(category)
        {
            case 0:
                return 'Automatic';
            case 101:
                return 'Sex';
            case 102:
                return 'PII';
            case 103:
                return 'Scam';
            case 104:
                return 'Bullying';
            case 105:
                return 'Disruption';
            case 106:
                return 'Other';
            case 111:
                return 'Sex';
            case 112:
                return 'Scam';
            case 113:
                return 'Disruption';
            case 114:
                return 'Other';
            case 121:
                return 'Sex';
            case 122:
                return 'PII';
            case 123:
                return 'Bullying';
            case 124:
                return 'Other';
            case 130:
                return 'Hate';
            case 131:
                return 'Violence';
            case 132:
                return 'Sex';
            case 133:
                return 'Illegal';
            case 134:
                return 'PII';
            case 135:
                return 'Copyright';
            case 136:
                return 'Spam';
            case 1024:
                return 'Guide';
            case 1025:
                return 'Bullying';
            case 1026:
                return 'Severe Alert';
            default:
                return 'Unknown';
        }
    }
}
