import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {ExtendedProfileData} from '../../incoming/users/ExtendedProfileData';

/**
 * ExtendedProfileMessageParser
 *
 * Based on AS3:
 * - com.sulake.habbo.communication.messages.parser.users.ExtendedProfileMessageEventParser
 * - com.sulake.habbo.communication.messages.parser.users.ExtendedProfileMessageParser
 */
export class ExtendedProfileMessageParser implements IMessageParser
{
	private _data: ExtendedProfileData | null = null;

	get data(): ExtendedProfileData | null
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
		if(!wrapper) return false;

		this._data = new ExtendedProfileData(wrapper);
		return true;
	}
}
