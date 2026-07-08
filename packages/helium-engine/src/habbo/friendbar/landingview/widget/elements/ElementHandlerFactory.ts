import type {IElementHandler} from '../../interfaces/elements/IElementHandler';
import {TextElementHandler} from './TextElementHandler';
import {TitleElementHandler} from './TitleElementHandler';
import {SpacingElementHandler} from './SpacingElementHandler';
import {CatalogButtonElementHandler} from './CatalogButtonElementHandler';
import {PromotedRoomButtonElementHandler} from './PromotedRoomButtonElementHandler';
import {LinkElementHandler} from './LinkElementHandler';
import {GoToRoomButtonElementHandler} from './GoToRoomButtonElementHandler';
import {RequestBadgeButtonElementHandler} from './RequestBadgeButtonElementHandler';
import {CreditHabbletButtonElementHandler} from './CreditHabbletButtonElementHandler';
import {CommunityGoalTimerElementHandler} from './CommunityGoalTimerElementHandler';
import {CustomTimerElementHandler} from './CustomTimerElementHandler';
import {GoToHomeRoomButtonElementHandler} from './GoToHomeRoomButtonElementHandler';
import {GoToCompetitionRoomButtonElementHandler} from './GoToCompetitionRoomButtonElementHandler';
import {RewardBadgeElementHandler} from './RewardBadgeElementHandler';
import {ImageElementHandler} from './ImageElementHandler';
import {SubmitCompetitionRoomElementHandler} from './SubmitCompetitionRoomElementHandler';
import {ConcurrentUsersMeterElementHandler} from './ConcurrentUsersMeterElementHandler';
import {ConcurrentUsersInfoElementHandler} from './ConcurrentUsersInfoElementHandler';
import {DailyQuestElementHandler} from './DailyQuestElementHandler';
import {BuyVipButtonElementHandler} from './BuyVipButtonElementHandler';
import {CommunityGoalScoreElementHandler} from './CommunityGoalScoreElementHandler';
import {InternalLinkButtonElementHandler} from './InternalLinkButtonElementHandler';

/**
 * Type-string constants and factory for `GenericWidget` content elements.
 *
 * AS3 identifier recovered from sources/win63_version/habbo/friendbar/landingview/widget/elements/class_4115.as
 * (obfuscated as `_SafeCls_4506` in the primary source).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as
 */
export class ElementHandlerFactory
{
    public static readonly CAPTION: string = 'caption';
    public static readonly TITLE: string = 'title';
    public static readonly SUBCAPTION: string = 'subcaption';
    public static readonly BODYTEXT: string = 'bodytext';
    public static readonly SPACING: string = 'spacing';
    public static readonly CATALOGBUTTON: string = 'catalogbutton';
    public static readonly PROMOTEDROOMBUTTON: string = 'promotedroombutton';
    public static readonly LINK: string = 'link';
    public static readonly GOTOROOMBUTTON: string = 'gotoroombutton';
    public static readonly REQUESTBADGEBUTTON: string = 'requestbadgebutton';
    public static readonly REQUESTBADGEBUTTONSECOND: string = 'requestbadgebuttonsecond';
    public static readonly REQUESTBADGEBUTTONTHIRD: string = 'requestbadgebuttonthird';
    public static readonly REQUESTBADGEBUTTONFOURTH: string = 'requestbadgebuttonfourth';
    public static readonly REQUESTBADGEBUTTONFIFTH: string = 'requestbadgebuttonfifth';
    public static readonly CREDITHABBLETBUTTON: string = 'credithabbletbutton';
    public static readonly COMMUNITYGOALTIMER: string = 'communitygoaltimer';
    public static readonly CUSTOMTIMER: string = 'customtimer';
    public static readonly GOTOHOMEROOMBUTTON: string = 'gotohomeroombutton';
    public static readonly GOTOCOMPETITIONROOMBUTTON: string = 'gotocompetitionroombutton';
    public static readonly REWARDBADGE: string = 'rewardbadge';
    public static readonly IMAGE: string = 'image';
    public static readonly SUBMITCOMPETITIONROOM: string = 'submitcompetitionroom';
    public static readonly CONCURRENTUSERSMETER: string = 'concurrentusersmeter';
    public static readonly CONCURRENTUSERSINFO: string = 'concurrentusersinfo';
    public static readonly DAILYQUEST: string = 'dailyquest';
    public static readonly BUYVIPBUTTON: string = 'buyvipbutton';
    public static readonly COMMUNITYGOALSCORE: string = 'communitygoalscore';
    public static readonly INTERNAL_LINK_BUTTON: string = 'internallinkbutton';

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::createHandler()
    public static createHandler(type: string): IElementHandler | null
    {
        switch(type)
        {
            case 'caption':
            case 'subcaption':
            case 'bodytext':
                return new TextElementHandler();
            case 'title':
                return new TitleElementHandler();
            case 'spacing':
                return new SpacingElementHandler();
            case 'catalogbutton':
                return new CatalogButtonElementHandler();
            case 'promotedroombutton':
                return new PromotedRoomButtonElementHandler();
            case 'link':
                return new LinkElementHandler();
            case 'gotoroombutton':
                return new GoToRoomButtonElementHandler();
            case 'requestbadgebutton':
            case 'requestbadgebuttonsecond':
            case 'requestbadgebuttonthird':
            case 'requestbadgebuttonfourth':
            case 'requestbadgebuttonfifth':
                return new RequestBadgeButtonElementHandler();
            case 'credithabbletbutton':
                return new CreditHabbletButtonElementHandler();
            case 'communitygoaltimer':
                return new CommunityGoalTimerElementHandler();
            case 'customtimer':
                return new CustomTimerElementHandler();
            case 'gotohomeroombutton':
                return new GoToHomeRoomButtonElementHandler();
            case 'gotocompetitionroombutton':
                return new GoToCompetitionRoomButtonElementHandler();
            case 'rewardbadge':
                return new RewardBadgeElementHandler();
            case 'image':
                return new ImageElementHandler();
            case 'submitcompetitionroom':
                return new SubmitCompetitionRoomElementHandler();
            case 'concurrentusersmeter':
                return new ConcurrentUsersMeterElementHandler();
            case 'concurrentusersinfo':
                return new ConcurrentUsersInfoElementHandler();
            case 'dailyquest':
                return new DailyQuestElementHandler();
            case 'buyvipbutton':
                return new BuyVipButtonElementHandler();
            case 'communitygoalscore':
                return new CommunityGoalScoreElementHandler();
            case 'internallinkbutton':
                return new InternalLinkButtonElementHandler();
            default:
                return null;
        }
    }
}
