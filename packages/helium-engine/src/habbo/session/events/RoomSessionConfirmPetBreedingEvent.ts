import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session confirm pet breeding event
 *
 * @see source_as_win63/habbo/session/events/RoomSessionConfirmPetBreedingEvent.as
 */
export class RoomSessionConfirmPetBreedingEvent extends RoomSessionEvent
{
	public static readonly CONFIRM_PET_BREEDING = 'RSPFUE_CONFIRM_PET_BREEDING';

	constructor(session: IRoomSession, nestId: number, pet1: unknown, pet2: unknown, rarityCategories: unknown[], resultPetTypeId: number)
	{
		super(RoomSessionConfirmPetBreedingEvent.CONFIRM_PET_BREEDING, session);
		this._nestId = nestId;
		this._pet1 = pet1;
		this._pet2 = pet2;
		this._rarityCategories = rarityCategories;
		this._resultPetTypeId = resultPetTypeId;
	}

	private _nestId: number;

	get nestId(): number
	{
		return this._nestId;
	}

	private _pet1: unknown;

	get pet1(): unknown
	{
		return this._pet1;
	}

	private _pet2: unknown;

	get pet2(): unknown
	{
		return this._pet2;
	}

	private _rarityCategories: unknown[];

	get rarityCategories(): unknown[]
	{
		return this._rarityCategories;
	}

	private _resultPetTypeId: number;

	get resultPetTypeId(): number
	{
		return this._resultPetTypeId;
	}
}
