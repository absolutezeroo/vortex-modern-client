import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session pet status update event
 *
 * @see source_as_win63/habbo/session/events/RoomSessionPetStatusUpdateEvent.as
 */
export class RoomSessionPetStatusUpdateEvent extends RoomSessionEvent
{
	public static readonly PET_STATUS_UPDATE = 'RSPFUE_PET_STATUS_UPDATE';

	constructor(session: IRoomSession, petId: number, canBreed: boolean, canHarvest: boolean, canRevive: boolean, hasBreedingPermission: boolean)
	{
		super(RoomSessionPetStatusUpdateEvent.PET_STATUS_UPDATE, session);
		this._petId = petId;
		this._canBreed = canBreed;
		this._canHarvest = canHarvest;
		this._canRevive = canRevive;
		this._hasBreedingPermission = hasBreedingPermission;
	}

	private _petId: number;

	get petId(): number
	{
		return this._petId;
	}

	private _canBreed: boolean;

	get canBreed(): boolean
	{
		return this._canBreed;
	}

	private _canHarvest: boolean;

	get canHarvest(): boolean
	{
		return this._canHarvest;
	}

	private _canRevive: boolean;

	get canRevive(): boolean
	{
		return this._canRevive;
	}

	private _hasBreedingPermission: boolean;

	get hasBreedingPermission(): boolean
	{
		return this._hasBreedingPermission;
	}
}
