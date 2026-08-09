import type {RoomWidgetRentableBotInfoUpdateEvent} from '../events/RoomWidgetRentableBotInfoUpdateEvent';

/**
 * InfoStandRentableBotData
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandRentableBotData.as
 *
 * The slice of the last rentable-bot info event the widget keeps between updates — what
 * `InfoStandWidget` answers with when something asks who the panel is currently showing.
 */
export class InfoStandRentableBotData
{
    // AS3: .../InfoStandRentableBotData.as::get userId()
    public userId: number = 0;
    // AS3: .../InfoStandRentableBotData.as::get name()
    public name: string = '';
    // AS3: .../InfoStandRentableBotData.as::get carryItem()
    public carryItem: number = 0;
    // AS3: .../InfoStandRentableBotData.as::get userRoomId()
    public userRoomId: number = 0;
    // AS3: .../InfoStandRentableBotData.as::get amIOwner()
    public amIOwner: boolean = false;
    // AS3: .../InfoStandRentableBotData.as::get amIAnyRoomController()
    public amIAnyRoomController: boolean = false;
    // AS3: .../InfoStandRentableBotData.as::get botSkills()
    public botSkills: number[] = [];

    private _badges: string[] = [];

    // AS3: .../InfoStandRentableBotData.as::get badges()
    public get badges(): string[]
    {
        return this._badges.slice();
    }

    // AS3: .../InfoStandRentableBotData.as::set badges()
    public set badges(value: string[])
    {
        this._badges = value;
    }

    // AS3: .../InfoStandRentableBotData.as::setData()
    public setData(event: RoomWidgetRentableBotInfoUpdateEvent): void
    {
        this.userId = event.webID;
        this.name = event.name;
        this.badges = event.badges;
        this.carryItem = event.carryItem;
        this.userRoomId = event.userRoomId;
        this.amIOwner = event.amIOwner;
        this.amIAnyRoomController = event.amIAnyRoomController;
        this.botSkills = event.botSkills;
    }
}
