import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for room info updated message
 *
 * @see source_as_win63/habbo/communication/messages/parser/navigator/RoomInfoUpdatedEventParser.as
 */
export class RoomInfoUpdatedMessageParser implements IMessageParser
{
	private _flatId: number = 0;

	get flatId(): number
	{
		return this._flatId;
	}

	flush(): boolean
	{
		this._flatId = 0;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		this._flatId = wrapper.readInt();
		return true;
	}
}
