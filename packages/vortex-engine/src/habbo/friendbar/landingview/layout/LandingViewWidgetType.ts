import type {ILandingViewWidget} from '../interfaces/ILandingViewWidget';
import type {HabboLandingView} from '../HabboLandingView';
import {AvatarImageWidget} from '../widget/AvatarImageWidget';
import {BonusRarePromoWidget} from '../widget/BonusRarePromoWidget';
import {CatalogPromoWidget} from '../widget/CatalogPromoWidget';
import {CatalogPromoWidgetSmall} from '../widget/CatalogPromoWidgetSmall';
import {CommunityGoalHallOfFameWidget} from '../widget/CommunityGoalHallOfFameWidget';
import {CommunityGoalPrizesWidget} from '../widget/CommunityGoalPrizesWidget';
import {CommunityGoalVsModeWidget} from '../widget/CommunityGoalVsModeWidget';
import {CommunityGoalVsModeWidgetWithVoting} from '../widget/CommunityGoalVsModeWidgetWithVoting';
import {CommunityGoalWidget} from '../widget/CommunityGoalWidget';
import {DailyQuestWidget} from '../widget/DailyQuestWidget';
import {ExpiringCatalogPageSmallWidget} from '../widget/ExpiringCatalogPageSmallWidget';
import {ExpiringCatalogPageWidget} from '../widget/ExpiringCatalogPageWidget';
import {GenericWidget} from '../widget/GenericWidget';
import {HabboModerationPromoWidget} from '../widget/HabboModerationPromoWidget';
import {HabboTalentsPromoWidget} from '../widget/HabboTalentsPromoWidget';
import {HabboWayPromoWidget} from '../widget/HabboWayPromoWidget';
import {NextLimitedRareCountdownWidget} from '../widget/NextLimitedRareCountdownWidget';
import {PromoArticleWidget} from '../widget/PromoArticleWidget';
import {RoomHopperNetworkWidget} from '../widget/RoomHopperNetworkWidget';
import {SafetyQuizPromoWidget} from '../widget/SafetyQuizPromoWidget';
import {WidgetContainerWidget} from '../widget/WidgetContainerWidget';

/**
 * Type-string constants and factory for landing view widgets.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/LandingViewWidgetType.as
 */
export class LandingViewWidgetType
{
    public static readonly AVATARIMAGE: string = 'avatarimage';
    public static readonly EXPIRINGCATALOGPAGE: string = 'expiringcatalogpage';
    public static readonly EXPIRINGCATALOGPAGESMALL: string = 'expiringcatalogpagesmall';
    public static readonly COMMUNITYGOAL: string = 'communitygoal';
    public static readonly COMMUNITYGOALVS: string = 'communitygoalvsmode';
    public static readonly COMMUNITYGOALVSVOTE: string = 'communitygoalvsmodevote';
    public static readonly CATALOGPROMO: string = 'catalogpromo';
    public static readonly CATALOGPROMOSMALL: string = 'catalogpromosmall';
    public static readonly ACHIEVEMENTCOMPETITIONHALLOFFAME: string = 'achievementcompetition_hall_of_fame';
    public static readonly ACHIEVEMENTCOMPETITIONPRIZES: string = 'achievementcompetition_prizes';
    public static readonly DAILYQUEST: string = 'dailyquest';
    public static readonly NEXTLIMITEDRARECOUNTDOWN: string = 'nextlimitedrarecountdown';
    public static readonly HABBOMODERATIONPROMO: string = 'habbomoderationpromo';
    public static readonly HABBOTALENTSPROMO: string = 'habbotalentspromo';
    public static readonly HABBOWAYPROMO: string = 'habbowaypromo';
    public static readonly ROOMHOPPERNETWORK: string = 'roomhoppernetwork';
    public static readonly SAFETYQUIZPROMO: string = 'safetyquizpromo';
    public static readonly GENERIC: string = 'generic';
    public static readonly WIDGETCONTAINER: string = 'widgetcontainer';
    public static readonly PROMOARTICLE: string = 'promoarticle';
    public static readonly BONUSRARE: string = 'bonusrare';

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/LandingViewWidgetType.as::getWidgetForType()
    public static getWidgetForType(type: string, landingView: HabboLandingView): ILandingViewWidget | null
    {
        switch(type)
        {
            case 'achievementcompetition_hall_of_fame':
                return new CommunityGoalHallOfFameWidget(landingView);
            case 'achievementcompetition_prizes':
                return new CommunityGoalPrizesWidget(landingView);
            case 'avatarimage':
                return new AvatarImageWidget(landingView);
            case 'communitygoal':
                return new CommunityGoalWidget(landingView);
            case 'communitygoalvsmode':
                return new CommunityGoalVsModeWidget(landingView);
            case 'communitygoalvsmodevote':
                return new CommunityGoalVsModeWidgetWithVoting(landingView);
            case 'catalogpromo':
                return new CatalogPromoWidget(landingView);
            case 'catalogpromosmall':
                return new CatalogPromoWidgetSmall(landingView);
            case 'dailyquest':
                return new DailyQuestWidget(landingView);
            case 'expiringcatalogpage':
                return new ExpiringCatalogPageWidget(landingView);
            case 'expiringcatalogpagesmall':
                return new ExpiringCatalogPageSmallWidget(landingView);
            case 'nextlimitedrarecountdown':
                return new NextLimitedRareCountdownWidget(landingView);
            case 'habbomoderationpromo':
                return new HabboModerationPromoWidget(landingView);
            case 'habbotalentspromo':
                return new HabboTalentsPromoWidget(landingView);
            case 'habbowaypromo':
                return new HabboWayPromoWidget(landingView);
            case 'roomhoppernetwork':
                return new RoomHopperNetworkWidget(landingView);
            case 'safetyquizpromo':
                return new SafetyQuizPromoWidget(landingView);
            case 'generic':
                return new GenericWidget(landingView);
            case 'widgetcontainer':
                return new WidgetContainerWidget(landingView);
            case 'promoarticle':
                return new PromoArticleWidget(landingView);
            case 'bonusrare':
                return new BonusRarePromoWidget(landingView);
            default:
                return null;
        }
    }
}
