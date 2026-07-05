/**
 * RoomObjectRoomPlaneVisibilityUpdateMessage
 *
 * @see source_as_win63/habbo/room/messages/RoomObjectRoomPlaneVisibilityUpdateMessage.as
 *
 * Update message for room plane visibility (wall/floor visibility toggle).
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectRoomPlaneVisibilityUpdateMessage extends RoomObjectUpdateMessage
{
    public static readonly WALL_VISIBILITY = 'RORPVUM_WALL_VISIBILITY';
    public static readonly FLOOR_VISIBILITY = 'RORPVUM_FLOOR_VISIBILITY';

    constructor(type: string, visible: boolean)
    {
        super(null, null);
        this._type = type;
        this._visible = visible;
    }

    private _type: string = '';

    get type(): string
    {
        return this._type;
    }

    private _visible: boolean = false;

    get visible(): boolean
    {
        return this._visible;
    }
}
