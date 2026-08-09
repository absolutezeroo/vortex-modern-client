/**
 * InfoStandUserData
 *
 * @see sources/win63_version/habbo/ui/widget/infostand/InfoStandUserData.as
 */
import type {RoomWidgetUserInfoUpdateEvent} from '../events/RoomWidgetUserInfoUpdateEvent';

export class InfoStandUserData
{
    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandUserData.as::get userId()
    public userId: number = 0;
    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandUserData.as::get userName()
    public userName: string = '';
    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandUserData.as::get groupId()
    public groupId: number = 0;
    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandUserData.as::get groupName()
    public groupName: string = '';
    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandUserData.as::get groupBadgeId()
    public groupBadgeId: string = '';
    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandUserData.as::get respectLeft()
    public respectLeft: number = 0;
    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandUserData.as::get respectReplenishesLeft()
    public respectReplenishesLeft: number = 0;
    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandUserData.as::get carryItem()
    public carryItem: number = 0;
    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandUserData.as::get userRoomId()
    public userRoomId: number = 0;
    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandUserData.as::get type()
    public type: string = '';
    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandUserData.as::get petRespectLeft()
    public petRespectLeft: number = 0;

    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandUserData.as::_badges
    private _badges: string[] = [];

    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandUserData.as::get badges()
    public get badges(): string[]
    {
        return this._badges.slice();
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandUserData.as::set badges()
    public set badges(value: string[])
    {
        this._badges = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserData.as::isBot()
    public isBot(): boolean
    {
        return this.type === 'RWUIUE_BOT';
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserData.as::setData()
    // TODO(AS3): selectedBadges/badgesRank (badge glow/preserve tracking) not
    // carried here — deferred with the same Phase 1 display-polish scope cut
    // as InfoStandWidget.onUserInfo()'s shouldPreserveDisplayedBadges().
    public setData(event: RoomWidgetUserInfoUpdateEvent): void
    {
        this.userId = event.webID;
        this.userName = event.name;
        this.badges = event.badges;
        this.groupId = event.groupId;
        this.groupName = event.groupName;
        this.groupBadgeId = event.groupBadgeId;
        this.respectLeft = event.respectLeft;
        this.respectReplenishesLeft = event.respectReplenishesLeft;
        this.carryItem = event.carryItem;
        this.userRoomId = event.userRoomId;
        this.type = event.type;
    }
}
