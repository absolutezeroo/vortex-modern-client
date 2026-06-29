import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * RoomCompetitionInitMessageComposer
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/competition/RoomCompetitionInitMessageComposer.as
 */
export class RoomCompetitionInitMessageComposer extends MessageComposer<ConstructorParameters<typeof RoomCompetitionInitMessageComposer>>
{
	private _data: ConstructorParameters<typeof RoomCompetitionInitMessageComposer>;

	constructor()
	{
		super();

		this._data = [];
	}

	getMessageArray()
	{
		return this._data;
	}
}
