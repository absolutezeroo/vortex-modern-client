import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for user rights/permissions
 * Message ID: 1416
 *
 * @see source_as_win63/habbo/communication/messages/parser/handshake/UserRightsMessageEventParser.as
 */
export class UserRightsMessageParser implements IMessageParser
{
	private _clubLevel: number = 0;

	get clubLevel(): number
	{
		return this._clubLevel;
	}

	private _securityLevel: number = 0;

	get securityLevel(): number
	{
		return this._securityLevel;
	}

	private _isAmbassador: boolean = false;

	get isAmbassador(): boolean
	{
		return this._isAmbassador;
	}

	flush(): boolean
	{
		this._clubLevel = 0;
		this._securityLevel = 0;
		this._isAmbassador = false;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (wrapper.bytesAvailable >= 4)
		{
			this._clubLevel = wrapper.readInt();
		}
		if (wrapper.bytesAvailable >= 4)
		{
			this._securityLevel = wrapper.readInt();
		}
		if (wrapper.bytesAvailable >= 1)
		{
			this._isAmbassador = wrapper.readBoolean();
		}
		return true;
	}
}
