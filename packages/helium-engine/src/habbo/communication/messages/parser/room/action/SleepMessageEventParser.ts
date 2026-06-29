/**
 * SleepMessageEventParser
 *
 * Based on AS3: com.sulake.habbo.communication.messages.parser.room.action.SleepMessageEventParser
 */
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class SleepMessageEventParser implements IMessageParser
{
	private _userId: number = 0;

	get userId(): number
	{
		return this._userId;
	}

	private _sleeping: boolean = false;

	get sleeping(): boolean
	{
		return this._sleeping;
	}

	flush(): boolean
	{
		this._userId = 0;
		this._sleeping = false;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (wrapper === null)
		{
			return false;
		}

		this._userId = wrapper.readInt();
		this._sleeping = wrapper.readBoolean();

		return true;
	}
}
