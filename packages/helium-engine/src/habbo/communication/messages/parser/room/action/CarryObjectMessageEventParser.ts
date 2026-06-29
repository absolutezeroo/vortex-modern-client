/**
 * CarryObjectMessageEventParser
 *
 * Based on AS3: com.sulake.habbo.communication.messages.parser.room.action.CarryObjectMessageEventParser
 */
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class CarryObjectMessageEventParser implements IMessageParser
{
	private _userId: number = 0;

	get userId(): number
	{
		return this._userId;
	}

	private _itemType: number = 0;

	get itemType(): number
	{
		return this._itemType;
	}

	flush(): boolean
	{
		this._userId = 0;
		this._itemType = 0;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (wrapper === null)
		{
			return false;
		}

		this._userId = wrapper.readInt();
		this._itemType = wrapper.readInt();

		return true;
	}
}
