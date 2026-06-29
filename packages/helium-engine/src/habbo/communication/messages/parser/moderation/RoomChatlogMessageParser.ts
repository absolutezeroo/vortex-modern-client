import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {ChatRecordData} from './ChatRecordData';

/**
 * Parser for room chatlog messages.
 *
 * @see source_as_win63/habbo/communication/messages/parser/moderation/RoomChatlogEventParser.as
 */
export class RoomChatlogMessageParser implements IMessageParser
{
	private _data: ChatRecordData | null = null;

	get data(): ChatRecordData | null
	{
		return this._data;
	}

	flush(): boolean
	{
		this._data = null;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._data = new ChatRecordData(wrapper);

		return true;
	}
}
