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
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/layout/LandingViewWidgetType.as
 */
export class LandingViewWidgetType
{
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/layout/LandingViewWidgetType.as::AVATARIMAGE
    public static readonly AVATARIMAGE: string = 'avatarimage';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/layout/LandingViewWidgetType.as::EXPIRINGCATALOGPAGE
    public static readonly EXPIRINGCATALOGPAGE: string = 'expiringcatalogpage';
    public static readonly EXPIRINGCATALOGPAGESMALL: string = 'expiringcatalogpagesmall';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/layout/LandingViewWidgetType.as::COMMUNITYGOAL
    public static readonly COMMUNITYGOAL: string = 'communitygoal';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/layout/LandingViewWidgetType.as::COMMUNITYGOALVS
    public static readonly COMMUNITYGOALVS: string = 'communitygoalvsmode';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/layout/LandingViewWidgetType.as::COMMUNITYGOALVSVOTE
    public static readonly COMMUNITYGOALVSVOTE: string = 'communitygoalvsmodevote';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/layout/LandingViewWidgetType.as::CATALOGPROMO
    public static readonly CATALOGPROMO: string = 'catalogpromo';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/layout/LandingViewWidgetType.as::CATALOGPROMOSMALL
    public static readonly CATALOGPROMOSMALL: string = 'catalogpromosmall';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/layout/LandingViewWidgetType.as::ACHIEVEMENTCOMPETITIONHALLOFFAME
    public static readonly ACHIEVEMENTCOMPETITIONHALLOFFAME: string = 'achievementcompetition_hall_of_fame';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/layout/LandingViewWidgetType.as::ACHIEVEMENTCOMPETITIONPRIZES
    public static readonly ACHIEVEMENTCOMPETITIONPRIZES: string = 'achievementcompetition_prizes';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/layout/LandingViewWidgetType.as::DAILYQUEST
    public static readonly DAILYQUEST: string = 'dailyquest';
    public static readonly NEXTLIMITEDRARECOUNTDOWN: string = 'nextlimitedrarecountdown';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/layout/LandingViewWidgetType.as::HABBOMODERATIONPROMO
    public static readonly HABBOMODERATIONPROMO: string = 'habbomoderationpromo';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/layout/LandingViewWidgetType.as::HABBOTALENTSPROMO
    public static readonly HABBOTALENTSPROMO: string = 'habbotalentspromo';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/layout/LandingViewWidgetType.as::HABBOWAYPROMO
    public static readonly HABBOWAYPROMO: string = 'habbowaypromo';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/layout/LandingViewWidgetType.as::ROOMHOPPERNETWORK
    public static readonly ROOMHOPPERNETWORK: string = 'roomhoppernetwork';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/layout/LandingViewWidgetType.as::SAFETYQUIZPROMO
    public static readonly SAFETYQUIZPROMO: string = 'safetyquizpromo';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/layout/LandingViewWidgetType.as::GENERIC
    public static readonly GENERIC: string = 'generic';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/layout/LandingViewWidgetType.as::WIDGETCONTAINER
    public static readonly WIDGETCONTAINER: string = 'widgetcontainer';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/layout/LandingViewWidgetType.as::PROMOARTICLE
    public static readonly PROMOARTICLE: string = 'promoarticle';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/layout/LandingViewWidgetType.as::BONUSRARE
    public static readonly BONUSRARE: string = 'bonusrare';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/layout/LandingViewWidgetType.as::getWidgetForType()
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
