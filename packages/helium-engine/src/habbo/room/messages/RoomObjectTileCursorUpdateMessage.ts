/**
 * RoomObjectTileCursorUpdateMessage
 *
 * @see source_as_win63/habbo/room/messages/RoomObjectTileCursorUpdateMessage.as
 *
 * Update message for tile cursor position and visibility.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';
import type {Vector3d} from '@room/utils/Vector3d';

export class RoomObjectTileCursorUpdateMessage extends RoomObjectUpdateMessage
{
    constructor(
        location: Vector3d,
        height: number,
        visible: boolean,
        sourceEventId: string,
        toggleVisibility: boolean = false
    )
    {
        super(location, null);

        this._height = height;
        this._visible = visible;
        this._sourceEventId = sourceEventId;
        this._toggleVisibility = toggleVisibility;
    }

    private _height: number;

    get height(): number
    {
        return this._height;
    }

    private _visible: boolean;

    get visible(): boolean
    {
        return this._visible;
    }

    private _sourceEventId: string;

    get sourceEventId(): string
    {
        return this._sourceEventId;
    }

    private _toggleVisibility: boolean;

    get toggleVisibility(): boolean
    {
        return this._toggleVisibility;
    }
}
