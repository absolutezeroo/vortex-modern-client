import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for latency ping response from the server
 *
 * @see source_as_win63/habbo/communication/messages/parser/tracking/LatencyPingResponseMessageParser.as
 */
export class LatencyPingResponseMessageParser implements IMessageParser
{
	private _requestId: number = -1;

	get requestId(): number
	{
		return this._requestId;
	}

	flush(): boolean
	{
		this._requestId = -1;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._requestId = wrapper.readInt();
		return true;
	}
}
