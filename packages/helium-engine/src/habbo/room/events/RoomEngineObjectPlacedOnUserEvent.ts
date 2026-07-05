/**
 * RoomEngineObjectPlacedOnUserEvent
 *
 * @see source_as_win63/habbo/room/events/RoomEngineObjectPlacedOnUserEvent.as
 *
 * Event dispatched when an object is placed on a user (e.g. pet food on pet).
 */
import {RoomEngineObjectEvent} from './RoomEngineObjectEvent';

export class RoomEngineObjectPlacedOnUserEvent extends RoomEngineObjectEvent
{
    constructor(
        type: string,
        roomId: number,
        objectId: number,
        category: number,
        droppedObjectId: number,
        droppedObjectCategory: number
    )
    {
        super(type, roomId, objectId, category);
        this._droppedObjectId = droppedObjectId;
        this._droppedObjectCategory = droppedObjectCategory;
    }

    private _droppedObjectId: number;

    get droppedObjectId(): number
    {
        return this._droppedObjectId;
    }

    private _droppedObjectCategory: number;

    get droppedObjectCategory(): number
    {
        return this._droppedObjectCategory;
    }
}
