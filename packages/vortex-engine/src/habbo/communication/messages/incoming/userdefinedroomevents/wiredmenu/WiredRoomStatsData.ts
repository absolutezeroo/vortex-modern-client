import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * WiredRoomStatsData — the room's wired resource statistics shown in the monitor tab: execution cost
 * vs cap, the "heavy" flag, floor/wall item counts vs caps, and permanent furni/user/global variable
 * counts vs caps. Parsed inline from the message wrapper in field order.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2538/WiredRoomStatsData.as
 */
export class WiredRoomStatsData
{
    // AS3: WiredRoomStatsData.as::_SafeStr_9170 (name derived: execution cost)
    private _executionCost: number;

    // AS3: WiredRoomStatsData.as::_SafeStr_9159 (name derived: execution cost cap)
    private _executionCostCap: number;

    // AS3: WiredRoomStatsData.as::_SafeStr_8986 (name derived: is-heavy)
    private _isHeavy: boolean;

    // AS3: WiredRoomStatsData.as::_SafeStr_10115 (name derived: floor item count)
    private _floorItemCount: number;

    // AS3: WiredRoomStatsData.as::_SafeStr_10083 (name derived: floor item cap)
    private _floorItemCap: number;

    // AS3: WiredRoomStatsData.as::_SafeStr_8806 (name derived: wall item count)
    private _wallItemCount: number;

    // AS3: WiredRoomStatsData.as::_SafeStr_9658 (name derived: wall item cap)
    private _wallItemCap: number;

    // AS3: WiredRoomStatsData.as::_SafeStr_9292 (name derived: permanent furni variables)
    private _permanentFurniVariables: number;

    // AS3: WiredRoomStatsData.as::_SafeStr_9125 (name derived: max permanent furni variables)
    private _maxPermanentFurniVariables: number;

    // AS3: WiredRoomStatsData.as::_SafeStr_9442 (name derived: permanent user variables)
    private _permanentUserVariables: number;

    // AS3: WiredRoomStatsData.as::_SafeStr_9273 (name derived: max permanent user variables)
    private _maxPermanentUserVariables: number;

    // AS3: WiredRoomStatsData.as::_SafeStr_9957 (name derived: permanent global variables)
    private _permanentGlobalVariables: number;

    // AS3: WiredRoomStatsData.as::_SafeStr_9095 (name derived: max permanent global variables)
    private _maxPermanentGlobalVariables: number;

    // AS3: WiredRoomStatsData.as::WiredRoomStatsData()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._executionCost = wrapper.readDouble();
        this._executionCostCap = wrapper.readDouble();
        this._isHeavy = wrapper.readBoolean();
        this._floorItemCount = wrapper.readInt();
        this._floorItemCap = wrapper.readInt();
        this._wallItemCount = wrapper.readInt();
        this._wallItemCap = wrapper.readInt();
        this._permanentFurniVariables = wrapper.readInt();
        this._maxPermanentFurniVariables = wrapper.readInt();
        this._permanentUserVariables = wrapper.readInt();
        this._maxPermanentUserVariables = wrapper.readInt();
        this._permanentGlobalVariables = wrapper.readInt();
        this._maxPermanentGlobalVariables = wrapper.readInt();
    }

    // AS3: WiredRoomStatsData.as::get executionCost()
    get executionCost(): number { return this._executionCost; }

    // AS3: WiredRoomStatsData.as::get executionCostCap()
    get executionCostCap(): number { return this._executionCostCap; }

    // AS3: WiredRoomStatsData.as::get isHeavy()
    get isHeavy(): boolean { return this._isHeavy; }

    // AS3: WiredRoomStatsData.as::get floorItemCount()
    get floorItemCount(): number { return this._floorItemCount; }

    // AS3: WiredRoomStatsData.as::get floorItemCap()
    get floorItemCap(): number { return this._floorItemCap; }

    // AS3: WiredRoomStatsData.as::get wallItemCount()
    get wallItemCount(): number { return this._wallItemCount; }

    // AS3: WiredRoomStatsData.as::get wallItemCap()
    get wallItemCap(): number { return this._wallItemCap; }

    // AS3: WiredRoomStatsData.as::get permanentFurniVariables()
    get permanentFurniVariables(): number { return this._permanentFurniVariables; }

    // AS3: WiredRoomStatsData.as::get maxPermanentFurniVariables()
    get maxPermanentFurniVariables(): number { return this._maxPermanentFurniVariables; }

    // AS3: WiredRoomStatsData.as::get permanentUserVariables()
    get permanentUserVariables(): number { return this._permanentUserVariables; }

    // AS3: WiredRoomStatsData.as::get maxPermanentUserVariables()
    get maxPermanentUserVariables(): number { return this._maxPermanentUserVariables; }

    // AS3: WiredRoomStatsData.as::get permanentGlobalVariables()
    get permanentGlobalVariables(): number { return this._permanentGlobalVariables; }

    // AS3: WiredRoomStatsData.as::get maxPermanentGlobalVariables()
    get maxPermanentGlobalVariables(): number { return this._maxPermanentGlobalVariables; }
}
