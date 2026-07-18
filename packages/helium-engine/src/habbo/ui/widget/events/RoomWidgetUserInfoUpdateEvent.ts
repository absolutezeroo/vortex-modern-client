/**
 * RoomWidgetUserInfoUpdateEvent
 *
 * @see sources/win63_version/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as
 */
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

export class RoomWidgetUserInfoUpdateEvent extends RoomWidgetUpdateEvent
{
    public static readonly OWN_USER: string = 'RWUIUE_OWN_USER';
    public static readonly BOT: string = 'RWUIUE_BOT';
    public static readonly PEER: string = 'RWUIUE_PEER';
    public static readonly TRADE_REASON_OK: number = 0;
    public static readonly TRADE_REASON_SHUTDOWN: number = 2;
    public static readonly TRADE_REASON_NO_TRADINGROOM: number = 3;
    public static readonly DEFAULT_BOT_BADGE_ID: string = 'BOT';

    public name: string = '';
    public motto: string = '';
    public achievementScore: number = 0;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::badgesRank
    public badgesRank: number = -1;
    public webID: number = 0;
    public xp: number = 0;
    public userType: number = 0;
    public figure: string = '';
    public badges: string[] = [];
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::selectedBadges
    // TODO(AS3): no producer sets this yet - AS3 populates it from
    // requestUserSelectedBadges()'s async response (getBadgeCodesFromSelectedBadges()),
    // deferred with the same Phase 1 display-polish scope cut noted in
    // InfoStandUserData.ts's own selectedBadges/badgesRank TODO.
    public selectedBadges: string[] = [];
    public groupId: number = 0;
    public groupName: string = '';
    public groupBadgeId: string = '';
    public canBeAskedAsFriend: boolean = false;
    public respectLeft: number = 0;
    public respectReplenishesLeft: number = 0;
    public isIgnored: boolean = false;
    public amIOwner: boolean = false;
    public isGuildRoom: boolean = false;
    public myRoomControllerLevel: number = 0;
    public amIAnyRoomController: boolean = false;
    public canTrade: boolean = false;
    public canTradeReason: number = 0;
    public canBeKicked: boolean = false;
    public canBeBanned: boolean = false;
    public canBeMuted: boolean = false;
    public targetRoomControllerLevel: number = 0;
    public carryItem: number = 0;
    public userRoomId: number = 0;
    public isSpectatorMode: boolean = false;
    public realName: string = '';
    public allowNameChange: boolean = false;
    public isFriend: boolean = false;
    public amIAnAmbassador: boolean = false;
    public isBlocked: boolean = false;

    // AS3: sources/win63_version/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::RoomWidgetUserInfoUpdateEvent()
    constructor(type: string)
    {
        super(type);
    }
}
