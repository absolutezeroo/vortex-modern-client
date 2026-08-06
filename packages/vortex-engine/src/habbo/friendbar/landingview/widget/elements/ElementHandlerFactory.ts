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
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as
 */
export class ElementHandlerFactory
{
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::CAPTION
    public static readonly CAPTION: string = 'caption';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::TITLE
    public static readonly TITLE: string = 'title';
    public static readonly SUBCAPTION: string = 'subcaption';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::BODYTEXT
    public static readonly BODYTEXT: string = 'bodytext';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::SPACING
    public static readonly SPACING: string = 'spacing';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::CATALOGBUTTON
    public static readonly CATALOGBUTTON: string = 'catalogbutton';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::PROMOTEDROOMBUTTON
    public static readonly PROMOTEDROOMBUTTON: string = 'promotedroombutton';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::LINK
    public static readonly LINK: string = 'link';
    public static readonly GOTOROOMBUTTON: string = 'gotoroombutton';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::REQUESTBADGEBUTTON
    public static readonly REQUESTBADGEBUTTON: string = 'requestbadgebutton';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::REQUESTBADGEBUTTONSECOND
    public static readonly REQUESTBADGEBUTTONSECOND: string = 'requestbadgebuttonsecond';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::REQUESTBADGEBUTTONTHIRD
    public static readonly REQUESTBADGEBUTTONTHIRD: string = 'requestbadgebuttonthird';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::REQUESTBADGEBUTTONFOURTH
    public static readonly REQUESTBADGEBUTTONFOURTH: string = 'requestbadgebuttonfourth';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::REQUESTBADGEBUTTONFIFTH
    public static readonly REQUESTBADGEBUTTONFIFTH: string = 'requestbadgebuttonfifth';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::CREDITHABBLETBUTTON
    public static readonly CREDITHABBLETBUTTON: string = 'credithabbletbutton';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::COMMUNITYGOALTIMER
    public static readonly COMMUNITYGOALTIMER: string = 'communitygoaltimer';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::CUSTOMTIMER
    public static readonly CUSTOMTIMER: string = 'customtimer';
    public static readonly GOTOHOMEROOMBUTTON: string = 'gotohomeroombutton';
    public static readonly GOTOCOMPETITIONROOMBUTTON: string = 'gotocompetitionroombutton';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::REWARDBADGE
    public static readonly REWARDBADGE: string = 'rewardbadge';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::IMAGE
    public static readonly IMAGE: string = 'image';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::SUBMITCOMPETITIONROOM
    public static readonly SUBMITCOMPETITIONROOM: string = 'submitcompetitionroom';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::CONCURRENTUSERSMETER
    public static readonly CONCURRENTUSERSMETER: string = 'concurrentusersmeter';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::CONCURRENTUSERSINFO
    public static readonly CONCURRENTUSERSINFO: string = 'concurrentusersinfo';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::DAILYQUEST
    public static readonly DAILYQUEST: string = 'dailyquest';
    public static readonly BUYVIPBUTTON: string = 'buyvipbutton';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::COMMUNITYGOALSCORE
    public static readonly COMMUNITYGOALSCORE: string = 'communitygoalscore';
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::INTERNAL_LINK_BUTTON
    public static readonly INTERNAL_LINK_BUTTON: string = 'internallinkbutton';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4506.as::createHandler()
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
