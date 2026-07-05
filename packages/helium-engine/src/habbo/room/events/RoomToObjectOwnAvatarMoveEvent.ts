/**
 * RoomToObjectOwnAvatarMoveEvent
 *
 * @see source_as_win63/habbo/room/events/RoomToObjectOwnAvatarMoveEvent.as
 *
 * Event dispatched to move the user's own avatar to a target location.
 */
import {RoomToObjectEvent} from '@room/events/RoomToObjectEvent';
import type {IVector3d} from '@room/utils/IVector3d';

export class RoomToObjectOwnAvatarMoveEvent extends RoomToObjectEvent
{
    public static readonly MOVE_TO = 'ROAME_MOVE_TO';

    constructor(type: string, targetLoc: IVector3d)
    {
        super(type);
        this._targetLoc = targetLoc;
    }

    private _targetLoc: IVector3d;

    get targetLoc(): IVector3d
    {
        return this._targetLoc;
    }
}
