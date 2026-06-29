import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * ForwardToRandomCompetitionRoomMessageComposer
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/competition/ForwardToRandomCompetitionRoomMessageComposer.as
 */
export class ForwardToRandomCompetitionRoomMessageComposer extends MessageComposer<ConstructorParameters<typeof ForwardToRandomCompetitionRoomMessageComposer>>
{
	private _data: ConstructorParameters<typeof ForwardToRandomCompetitionRoomMessageComposer>;

	constructor(goalCode: string)
	{
		super();

		this._data = [goalCode];
	}

	getMessageArray()
	{
		return this._data;
	}
}
