import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * HanditemConfigurationMessageParser
 *
 * Based on AS3: com.sulake.habbo.communication.messages.parser.room.session.HanditemConfigurationMessageEventParser
 */
export class HanditemConfigurationMessageParser implements IMessageParser
{
	private _isHanditemControlBlocked: boolean = false;

	get isHanditemControlBlocked(): boolean
	{
		return this._isHanditemControlBlocked;
	}

	flush(): boolean
	{
		this._isHanditemControlBlocked = false;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper)
		{
			return false;
		}

		this._isHanditemControlBlocked = wrapper.readBoolean();
		return true;
	}
}
