import {MessageComposer} from '@core/communication/messages/MessageComposer';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';

/**
 * Places a new object (from inventory) into the active room.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/room/engine/PlaceObjectMessageComposer.as
 *
 * TODO(AS3): wall-item placement (category 20, `wallLocation` string format
 * "w=x,y l=offset,z r|l") is not implemented yet — only floor items (category 10).
 */
export class PlaceObjectMessageComposer extends MessageComposer<[string]>
{
    private _itemId: number;
    private _category: number;
    private _x: number;
    private _y: number;
    private _rotation: number;

    constructor(itemId: number, x: number, y: number, rotation: number)
    {
        super();

        this._itemId = itemId;
        this._category = RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE;
        this._x = x;
        this._y = y;
        this._rotation = rotation;
    }

    getMessageArray(): [string]
    {
        if(this._category === RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE)
        {
            return [`${this._itemId} ${this._x} ${this._y} ${this._rotation}`];
        }

        return [''];
    }
}
