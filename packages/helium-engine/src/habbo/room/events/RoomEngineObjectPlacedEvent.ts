/**
 * RoomEngineObjectPlacedEvent
 *
 * @see source_as_win63/habbo/room/events/RoomEngineObjectPlacedEvent.as
 *
 * Event dispatched when an object is placed in the room.
 */
import {RoomEngineObjectEvent} from './RoomEngineObjectEvent';

export class RoomEngineObjectPlacedEvent extends RoomEngineObjectEvent
{
    constructor(
        type: string,
        roomId: number,
        objectId: number,
        category: number,
        wallLocation: string,
        x: number,
        y: number,
        z: number,
        direction: number,
        placedInRoom: boolean,
        placedOnFloor: boolean,
        placedOnWall: boolean,
        instanceData: string | null
    )
    {
        super(type, roomId, objectId, category);
        this._wallLocation = wallLocation;
        this._x = x;
        this._y = y;
        this._z = z;
        this._direction = direction;
        this._placedInRoom = placedInRoom;
        this._placedOnFloor = placedOnFloor;
        this._placedOnWall = placedOnWall;
        this._instanceData = instanceData;
    }

    private _wallLocation: string = '';

    get wallLocation(): string
    {
        return this._wallLocation;
    }

    private _x: number = 0;

    get x(): number
    {
        return this._x;
    }

    private _y: number = 0;

    get y(): number
    {
        return this._y;
    }

    private _z: number = 0;

    get z(): number
    {
        return this._z;
    }

    private _direction: number = 0;

    get direction(): number
    {
        return this._direction;
    }

    private _placedInRoom: boolean = false;

    get placedInRoom(): boolean
    {
        return this._placedInRoom;
    }

    private _placedOnFloor: boolean = false;

    get placedOnFloor(): boolean
    {
        return this._placedOnFloor;
    }

    private _placedOnWall: boolean = false;

    get placedOnWall(): boolean
    {
        return this._placedOnWall;
    }

    private _instanceData: string | null = null;

    get instanceData(): string | null
    {
        return this._instanceData;
    }
}
