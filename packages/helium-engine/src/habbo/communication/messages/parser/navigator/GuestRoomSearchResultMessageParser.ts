import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {GuestRoomSearchResultData} from '../../incoming/navigator';

/**
 * Parser for guest room search result message
 *
 * @see source_as_win63/habbo/communication/messages/parser/navigator/GuestRoomSearchResultEventParser.as
 */
export class GuestRoomSearchResultMessageParser implements IMessageParser
{
	private _data: GuestRoomSearchResultData | null = null;

	get data(): GuestRoomSearchResultData | null
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
		this._data = new GuestRoomSearchResultData(wrapper);
		return true;
	}
}
