/**
 * RoomVisitHistoryEntry
 *
 * One back/forward-navigable entry in RoomVisitHistory — a visited room's flat id and the last
 * name seen for it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/roomtools/RoomVisitHistoryEntry.as
 */
export class RoomVisitHistoryEntry
{
    // AS3: RoomVisitHistoryEntry.as::_flatId
    private readonly _flatId: number;
    // AS3: RoomVisitHistoryEntry.as::_roomName
    private _roomName: string;

    // AS3: RoomVisitHistoryEntry.as::RoomVisitHistoryEntry()
    constructor(flatId: number, roomName: string)
    {
        this._flatId = flatId;
        this._roomName = roomName;
    }

    // AS3: RoomVisitHistoryEntry.as::get flatId()
    public get flatId(): number
    {
        return this._flatId;
    }

    // AS3: RoomVisitHistoryEntry.as::get roomName()
    public get roomName(): string
    {
        return this._roomName;
    }

    // AS3: RoomVisitHistoryEntry.as::set roomName()
    public set roomName(value: string)
    {
        this._roomName = value;
    }

    // AS3: RoomVisitHistoryEntry.as::copy()
    public copy(): RoomVisitHistoryEntry
    {
        return new RoomVisitHistoryEntry(this._flatId, this._roomName);
    }
}
