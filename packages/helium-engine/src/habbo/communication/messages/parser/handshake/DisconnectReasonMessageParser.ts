import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for disconnect reason
 * Message ID: 4000
 *
 * @see source_as_win63/habbo/communication/messages/parser/handshake/DisconnectReasonEventParser.as
 */
export class DisconnectReasonMessageParser implements IMessageParser
{
	private _reason: number = -1;

	get reason(): number
	{
		return this._reason;
	}

	/**
	 * Get human-readable disconnect reason
	 */
	get reasonText(): string
	{
		switch (this._reason)
		{
			case -2:
				return 'Maintenance';
			case 0:
				return 'Logged out';
			case 1:
				return 'Just banned';
			case 2:
			case 11:
			case 13:
			case 18:
				return 'Concurrent login';
			case 10:
				return 'Still banned';
			case 12:
			case 19:
				return 'Hotel closed';
			case 20:
				return 'Incorrect password';
			case 22:
				return 'Incompatible client version';
			default:
				return `Unknown reason (${this._reason})`;
		}
	}

	flush(): boolean
	{
		this._reason = -1;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (wrapper.bytesAvailable >= 4)
		{
			this._reason = wrapper.readInt();
		}
		return true;
	}
}
