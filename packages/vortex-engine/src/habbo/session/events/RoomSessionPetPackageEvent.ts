import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session pet package event
 *
 * @see source_as_win63/habbo/session/events/RoomSessionPetPackageEvent.as
 */
export class RoomSessionPetPackageEvent extends RoomSessionEvent
{
    public static readonly RSOPPE_OPEN_PET_PACKAGE_REQUESTED = 'RSOPPE_OPEN_PET_PACKAGE_REQUESTED';
    public static readonly RSOPPE_OPEN_PET_PACKAGE_RESULT = 'RSOPPE_OPEN_PET_PACKAGE_RESULT';

    constructor(
        type: string,
        session: IRoomSession,
        objectId: number,
        figureData: unknown = null,
        nameValidationStatus: number = 0,
        nameValidationInfo: string | null = null
    )
    {
        super(type, session);
        this._objectId = objectId;
        this._figureData = figureData;
        this._nameValidationStatus = nameValidationStatus;
        this._nameValidationInfo = nameValidationInfo;
    }

    private _objectId: number;

    get objectId(): number
    {
        return this._objectId;
    }

    private _figureData: unknown;

    get figureData(): unknown
    {
        return this._figureData;
    }

    private _nameValidationStatus: number;

    get nameValidationStatus(): number
    {
        return this._nameValidationStatus;
    }

    private _nameValidationInfo: string | null;

    get nameValidationInfo(): string | null
    {
        return this._nameValidationInfo;
    }
}
