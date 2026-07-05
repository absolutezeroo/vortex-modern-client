import type {IRoomSession} from '../IRoomSession';
import type {IPetInfo} from '../IPetInfo';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session pet info update event
 *
 * @see source_as_win63/habbo/session/events/RoomSessionPetInfoUpdateEvent.as
 */
export class RoomSessionPetInfoUpdateEvent extends RoomSessionEvent
{
    public static readonly PET_INFO = 'RSPIUE_PET_INFO';

    constructor(session: IRoomSession, petInfo: IPetInfo)
    {
        super(RoomSessionPetInfoUpdateEvent.PET_INFO, session);
        this._petInfo = petInfo;
    }

    private _petInfo: IPetInfo;

    get petInfo(): IPetInfo
    {
        return this._petInfo;
    }
}
