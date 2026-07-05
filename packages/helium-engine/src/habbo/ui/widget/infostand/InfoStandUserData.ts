/**
 * InfoStandUserData
 *
 * @see sources/win63_version/habbo/ui/widget/infostand/InfoStandUserData.as
 */
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

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandUserData.as::setData()
    // TODO(AS3): param is RoomWidgetUserInfoUpdateEvent (not yet ported — out of scope
    // for the furni-only infostand port, see InfoStandUserView.ts).
    public setData(_event: unknown): void
    {
    }
}
