import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for availability status message
 * Indicates if the hotel is open, shutting down, etc.
 *
 * @see source_as_win63/habbo/communication/messages/parser/availability/AvailabilityStatusMessageEventParser.as
 */
export class AvailabilityStatusMessageParser implements IMessageParser
{
	private _isOpen: boolean = false;

	get isOpen(): boolean
	{
		return this._isOpen;
	}

	private _onShutDown: boolean = false;

	get onShutDown(): boolean
	{
		return this._onShutDown;
	}

	private _isAuthenticHabbo: boolean = false;

	get isAuthenticHabbo(): boolean
	{
		return this._isAuthenticHabbo;
	}

	flush(): boolean
	{
		this._isOpen = false;
		this._onShutDown = false;
		this._isAuthenticHabbo = false;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		this._isOpen = wrapper.readBoolean();
		this._onShutDown = wrapper.readBoolean();
		if (wrapper.bytesAvailable > 0)
		{
			this._isAuthenticHabbo = wrapper.readBoolean();
		}
		return true;
	}
}
