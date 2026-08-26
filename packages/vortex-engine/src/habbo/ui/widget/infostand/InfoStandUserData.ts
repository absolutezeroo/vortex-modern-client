/**
 * InfoStandUserData
 *
 * @see sources/win63_version/habbo/ui/widget/infostand/InfoStandUserData.as
 */
import type {RoomWidgetUserInfoUpdateEvent} from '../events/RoomWidgetUserInfoUpdateEvent';
import type {ISelectedBadge} from '@habbo/communication/messages/parser/users/HabboUserBadgesMessageParser';

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

    /**
     * The player's rank on the badge leaderboard, or -1 for "no rank" — which is also what hides
     * the row and what the click handler tests before opening the leaderboard. Set by
     * `InfoStandWidget.updateUserData()`, not by `setData()`: it arrives on a later message than
     * the rest of this record.
     */
    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandUserData.as::badgesRank
    public badgesRank: number = -1;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserData.as::selectedBadges
    // Kept alongside `badges` because `InfoStandWidget.onUserInfo()` compares the *previous* record
    // against the incoming one to decide whether to repaint and whether to glow.
    public selectedBadges: ISelectedBadge[] = [];

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserData.as::getSelectedBadge()
    public getSelectedBadge(slotIndex: number): ISelectedBadge | null
    {
        for(const badge of this.selectedBadges)
        {
            if(badge !== null && badge.slotId === slotIndex) return badge;
        }

        return null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserData.as::getBadgeSlot()
    public getBadgeSlot(badgeCode: string): number
    {
        for(const badge of this.selectedBadges)
        {
            if(badge !== null && badge.badgeCode === badgeCode) return badge.slotId;
        }

        return this._badges.indexOf(badgeCode);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandUserData.as::setData()
    public setData(event: RoomWidgetUserInfoUpdateEvent): void
    {
        this.userId = event.webID;
        this.userName = event.name;
        this.badges = event.badges;
        this.selectedBadges = event.selectedBadges;
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
