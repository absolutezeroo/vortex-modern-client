/**
 * RoomEngineUseProductEvent
 *
 * @see source_as_win63/habbo/room/events/RoomEngineUseProductEvent.as
 *
 * Event dispatched when using a product on a room object (e.g. pet food).
 */
import {RoomEngineObjectEvent} from './RoomEngineObjectEvent';

export class RoomEngineUseProductEvent extends RoomEngineObjectEvent
{
    public static readonly USE_PRODUCT_FROM_ROOM = 'ROSM_USE_PRODUCT_FROM_ROOM';
    public static readonly USE_PRODUCT_FROM_INVENTORY = 'ROSM_USE_PRODUCT_FROM_INVENTORY';

    constructor(
        type: string,
        roomId: number,
        objectId: number,
        category: number,
        inventoryStripId: number = -1,
        furnitureTypeId: number = -1
    )
    {
        super(type, roomId, objectId, category);
        this._inventoryStripId = inventoryStripId;
        this._furnitureTypeId = furnitureTypeId;
    }

    private _inventoryStripId: number;

    get inventoryStripId(): number
    {
        return this._inventoryStripId;
    }

    private _furnitureTypeId: number;

    get furnitureTypeId(): number
    {
        return this._furnitureTypeId;
    }
}
