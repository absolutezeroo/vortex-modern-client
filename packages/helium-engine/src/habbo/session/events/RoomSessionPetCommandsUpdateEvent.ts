import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session pet commands update event
 *
 * @see source_as_win63/habbo/session/events/RoomSessionPetCommandsUpdateEvent.as
 */
export class RoomSessionPetCommandsUpdateEvent extends RoomSessionEvent
{
    public static readonly PET_COMMANDS = 'RSPIUE_ENABLED_PET_COMMANDS';

    constructor(session: IRoomSession, petId: number, allCommands: number[], enabledCommands: number[])
    {
        super(RoomSessionPetCommandsUpdateEvent.PET_COMMANDS, session);
        this._petId = petId;
        this._allCommands = allCommands;
        this._enabledCommands = enabledCommands;
    }

    private _petId: number;

    get petId(): number
    {
        return this._petId;
    }

    private _allCommands: number[];

    get allCommands(): number[]
    {
        return this._allCommands;
    }

    private _enabledCommands: number[];

    get enabledCommands(): number[]
    {
        return this._enabledCommands;
    }
}
