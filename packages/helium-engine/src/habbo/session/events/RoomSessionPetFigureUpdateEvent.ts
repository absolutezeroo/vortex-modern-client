import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session pet figure update event
 *
 * @see source_as_win63/habbo/session/events/RoomSessionPetFigureUpdateEvent.as
 */
export class RoomSessionPetFigureUpdateEvent extends RoomSessionEvent
{
	public static readonly PET_FIGURE_UPDATE = 'RSPFUE_PET_FIGURE_UPDATE';

	constructor(session: IRoomSession, petId: number, figure: string)
	{
		super(RoomSessionPetFigureUpdateEvent.PET_FIGURE_UPDATE, session);
		this._petId = petId;
		this._figure = figure;
	}

	private _petId: number;

	get petId(): number
	{
		return this._petId;
	}

	private _figure: string;

	get figure(): string
	{
		return this._figure;
	}
}
