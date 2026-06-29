import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * YouAreNotSpectatorMessageParser
 *
 * Based on AS3: com.sulake.habbo.communication.messages.parser.room.session.YouAreNotSpectatorMessageEventParser
 */
export class YouAreNotSpectatorMessageParser implements IMessageParser
{
	private _flatId: number = 0;

	get flatId(): number
	{
		return this._flatId;
	}

	flush(): boolean
	{
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper)
		{
			return false;
		}

		this._flatId = wrapper.readInt();
		return true;
	}
}
