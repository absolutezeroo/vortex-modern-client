import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session error message event
 *
 * @see source_as_win63/habbo/session/events/RoomSessionErrorMessageEvent.as
 */
export class RoomSessionErrorMessageEvent extends RoomSessionEvent
{
    public static readonly KICKED_BY_OWNER = 'RSEME_KICKED';
    public static readonly PETS_FORBIDDEN_IN_HOTEL = 'RSEME_PETS_FORBIDDEN_IN_HOTEL';
    public static readonly PETS_FORBIDDEN_IN_FLAT = 'RSEME_PETS_FORBIDDEN_IN_FLAT';
    public static readonly MAX_NUMBER_OF_PETS = 'RSEME_MAX_PETS';
    public static readonly MAX_NUMBER_OF_OWN_PETS = 'RSEME_MAX_NUMBER_OF_OWN_PETS';
    public static readonly NO_FREE_TILES_FOR_PET = 'RSEME_NO_FREE_TILES_FOR_PET';
    public static readonly SELECTED_TILE_NOT_FREE_FOR_PET = 'RSEME_SELECTED_TILE_NOT_FREE_FOR_PET';
    public static readonly BOTS_FORBIDDEN_IN_HOTEL = 'RSEME_BOTS_FORBIDDEN_IN_HOTEL';
    public static readonly BOTS_FORBIDDEN_IN_FLAT = 'RSEME_BOTS_FORBIDDEN_IN_FLAT';
    public static readonly BOT_LIMIT_REACHED = 'RSEME_BOT_LIMIT_REACHED';
    public static readonly SELECTED_TILE_NOT_FREE_FOR_BOT = 'RSEME_SELECTED_TILE_NOT_FREE_FOR_BOT';
    public static readonly BOT_NAME_NOT_ACCEPTED = 'RSEME_BOT_NAME_NOT_ACCEPTED';

    constructor(type: string, session: IRoomSession, message: string | null = null, openLandingPage: boolean = false)
    {
        super(type, session, openLandingPage);
        this._message = message;
    }

    private _message: string | null;

    get message(): string | null
    {
        return this._message;
    }
}
