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

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/events/RoomEngineObjectPlacedEvent.as::_wallLocation
    private _wallLocation: string = '';

    // AS3: .../src/com/sulake/habbo/room/events/RoomEngineObjectPlacedEvent.as::get wallLocation()
    get wallLocation(): string
    {
        return this._wallLocation;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/events/RoomEngineObjectPlacedEvent.as::_x
    private _x: number = 0;

    // AS3: .../src/com/sulake/habbo/room/events/RoomEngineObjectPlacedEvent.as::get x()
    get x(): number
    {
        return this._x;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/events/RoomEngineObjectPlacedEvent.as::_y
    private _y: number = 0;

    // AS3: .../src/com/sulake/habbo/room/events/RoomEngineObjectPlacedEvent.as::get y()
    get y(): number
    {
        return this._y;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/events/RoomEngineObjectPlacedEvent.as::_z
    private _z: number = 0;

    // AS3: .../src/com/sulake/habbo/room/events/RoomEngineObjectPlacedEvent.as::get z()
    get z(): number
    {
        return this._z;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/events/RoomEngineObjectPlacedEvent.as::_direction
    private _direction: number = 0;

    // AS3: .../src/com/sulake/habbo/room/events/RoomEngineObjectPlacedEvent.as::get direction()
    get direction(): number
    {
        return this._direction;
    }

    // AS3: .../src/com/sulake/habbo/room/events/RoomEngineObjectPlacedEvent.as::_placedInRoom
    private _placedInRoom: boolean = false;

    // AS3: .../src/com/sulake/habbo/room/events/RoomEngineObjectPlacedEvent.as::get placedInRoom()
    get placedInRoom(): boolean
    {
        return this._placedInRoom;
    }

    // AS3: sources/win63_version/habbo/room/events/RoomEngineObjectPlacedEvent.as::_placedOnFloor
    private _placedOnFloor: boolean = false;

    // AS3: .../src/com/sulake/habbo/room/events/RoomEngineObjectPlacedEvent.as::get placedOnFloor()
    get placedOnFloor(): boolean
    {
        return this._placedOnFloor;
    }

    // AS3: .../src/com/sulake/habbo/room/events/RoomEngineObjectPlacedEvent.as::_placedOnWall
    private _placedOnWall: boolean = false;

    // AS3: .../src/com/sulake/habbo/room/events/RoomEngineObjectPlacedEvent.as::get placedOnWall()
    get placedOnWall(): boolean
    {
        return this._placedOnWall;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/events/RoomEngineObjectPlacedEvent.as::_instanceData
    private _instanceData: string | null = null;

    // AS3: .../src/com/sulake/habbo/room/events/RoomEngineObjectPlacedEvent.as::get instanceData()
    get instanceData(): string | null
    {
        return this._instanceData;
    }
}
