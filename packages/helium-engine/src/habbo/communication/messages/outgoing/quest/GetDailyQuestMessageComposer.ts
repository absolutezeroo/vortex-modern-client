import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the daily quest from the server.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/quest/GetDailyQuestMessageComposer.as
 */
export class GetDailyQuestMessageComposer extends MessageComposer<ConstructorParameters<typeof GetDailyQuestMessageComposer>>
{
	private _data: ConstructorParameters<typeof GetDailyQuestMessageComposer>;

	constructor(isEasy: boolean, dayIndex: number)
	{
		super();
		this._data = [isEasy, dayIndex];
	}

	getMessageArray()
	{
		return this._data;
	}
}
