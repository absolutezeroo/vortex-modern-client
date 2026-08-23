/**
 * RoomWidgetUserInfoUpdateEvent
 *
 * @see sources/win63_version/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as
 */
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';
import type {ISelectedBadge} from '@habbo/communication/messages/parser/users/HabboUserBadgesMessageParser';

export class RoomWidgetUserInfoUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::OWN_USER
    public static readonly OWN_USER: string = 'RWUIUE_OWN_USER';
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::BOT
    public static readonly BOT: string = 'RWUIUE_BOT';
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::PEER
    public static readonly PEER: string = 'RWUIUE_PEER';
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::TRADE_REASON_OK
    public static readonly TRADE_REASON_OK: number = 0;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::TRADE_REASON_SHUTDOWN
    public static readonly TRADE_REASON_SHUTDOWN: number = 2;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::TRADE_REASON_NO_TRADINGROOM
    public static readonly TRADE_REASON_NO_TRADINGROOM: number = 3;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::DEFAULT_BOT_BADGE_ID
    public static readonly DEFAULT_BOT_BADGE_ID: string = 'BOT';

    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get name()
    public name: string = '';
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get motto()
    public motto: string = '';
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get achievementScore()
    public achievementScore: number = 0;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::badgesRank
    public badgesRank: number = -1;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get webID()
    public webID: number = 0;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get xp()
    public xp: number = 0;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get userType()
    public userType: number = 0;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get figure()
    public figure: string = '';
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get badges()
    public badges: string[] = [];
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::selectedBadges
    // The slot-indexed form of `badges` above, and the richer one: it carries each badge's rarity,
    // which is what decides the glow. `badges` is derived from it when it is present.
    public selectedBadges: ISelectedBadge[] = [];
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get groupId()
    public groupId: number = 0;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get groupName()
    public groupName: string = '';
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get groupBadgeId()
    public groupBadgeId: string = '';
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get canBeAskedAsFriend()
    public canBeAskedAsFriend: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get respectLeft()
    public respectLeft: number = 0;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get respectReplenishesLeft()
    public respectReplenishesLeft: number = 0;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get isIgnored()
    public isIgnored: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get amIOwner()
    public amIOwner: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get isGuildRoom()
    public isGuildRoom: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get myRoomControllerLevel()
    public myRoomControllerLevel: number = 0;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get amIAnyRoomController()
    public amIAnyRoomController: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get canTrade()
    public canTrade: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get canTradeReason()
    public canTradeReason: number = 0;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get canBeKicked()
    public canBeKicked: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get canBeBanned()
    public canBeBanned: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get canBeMuted()
    public canBeMuted: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get targetRoomControllerLevel()
    public targetRoomControllerLevel: number = 0;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get carryItem()
    public carryItem: number = 0;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get userRoomId()
    public userRoomId: number = 0;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get isSpectatorMode()
    public isSpectatorMode: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get realName()
    public realName: string = '';
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get allowNameChange()
    public allowNameChange: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get isFriend()
    public isFriend: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get amIAnAmbassador()
    public amIAnAmbassador: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::get isBlocked()
    public isBlocked: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent.as::RoomWidgetUserInfoUpdateEvent()
    constructor(type: string)
    {
        super(type);
    }
}
