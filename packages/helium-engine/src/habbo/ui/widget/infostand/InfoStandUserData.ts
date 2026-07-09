/**
 * InfoStandUserData
 *
 * @see sources/win63_version/habbo/ui/widget/infostand/InfoStandUserData.as
 */
import type {RoomWidgetUserInfoUpdateEvent} from '../events/RoomWidgetUserInfoUpdateEvent';

export class InfoStandUserData
{
    public userId: number = 0;
    public userName: string = '';
    public groupId: number = 0;
    public groupName: string = '';
    public groupBadgeId: string = '';
    public respectLeft: number = 0;
    public respectReplenishesLeft: number = 0;
    public carryItem: number = 0;
    public userRoomId: number = 0;
    public type: string = '';
    public petRespectLeft: number = 0;

    private _badges: string[] = [];

    public get badges(): string[]
    {
        return this._badges.slice();
    }

    public set badges(value: string[])
    {
        this._badges = value;
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandUserData.as::isBot()
    public isBot(): boolean
    {
        return this.type === 'RWUIUE_BOT';
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserData.as::setData()
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
