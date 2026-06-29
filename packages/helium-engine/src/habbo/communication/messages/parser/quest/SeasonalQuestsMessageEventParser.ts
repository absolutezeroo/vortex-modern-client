import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {QuestMessageData} from './QuestMessageData';

/**
 * Parser for the seasonal quests list message.
 *
 * Parses a list of seasonal quests from the server.
 *
 * @see source_as_win63/habbo/communication/messages/parser/quest/SeasonalQuestsMessageEventParser.as
 */
export class SeasonalQuestsMessageEventParser implements IMessageParser
{
	private _quests: QuestMessageData[] = [];

	get quests(): QuestMessageData[]
	{
		return this._quests;
	}

	flush(): boolean
	{
		this._quests = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		const count: number = wrapper.readInt();

		for (let i = 0; i < count; i++)
		{
			this._quests.push(new QuestMessageData(wrapper));
		}

		return true;
	}
}
