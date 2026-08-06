/**
 * InfoStandRentableBotData
 *
 * @see sources/win63_version/habbo/ui/widget/infostand/InfoStandRentableBotData.as
 */
export class InfoStandRentableBotData
{
    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandRentableBotData.as::get userId()
    public userId: number = 0;
    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandRentableBotData.as::get name()
    public name: string = '';
    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandRentableBotData.as::get carryItem()
    public carryItem: number = 0;
    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandRentableBotData.as::get userRoomId()
    public userRoomId: number = 0;
    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandRentableBotData.as::get amIOwner()
    public amIOwner: boolean = false;
    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandRentableBotData.as::get amIAnyRoomController()
    public amIAnyRoomController: boolean = false;
    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandRentableBotData.as::get botSkills()
    public botSkills: unknown[] = [];

    private _badges: string[] = [];

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandRentableBotData.as::get badges()
    public get badges(): string[]
    {
        return this._badges.slice();
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandRentableBotData.as::set badges()
    public set badges(value: string[])
    {
        this._badges = value;
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandRentableBotData.as::setData()
    // TODO(AS3): param is RoomWidgetRentableBotInfoUpdateEvent (not yet ported —
    // out of scope for the furni-only infostand port, see InfoStandRentableBotView.ts).
    public setData(_event: unknown): void
    {
    }
}
