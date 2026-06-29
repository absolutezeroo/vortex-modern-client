import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for maintenance status message
 *
 * @see source_as_win63/habbo/communication/messages/parser/availability/MaintenanceStatusMessageEventParser.as
 */
export class MaintenanceStatusMessageEventParser implements IMessageParser
{
	private _isInMaintenance: boolean = false;

	get isInMaintenance(): boolean
	{
		return this._isInMaintenance;
	}

	private _minutesUntilMaintenance: number = 0;

	get minutesUntilMaintenance(): number
	{
		return this._minutesUntilMaintenance;
	}

	private _duration: number = 15;

	get duration(): number
	{
		return this._duration;
	}

	flush(): boolean
	{
		this._isInMaintenance = false;
		this._minutesUntilMaintenance = 0;
		this._duration = 15;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		this._isInMaintenance = wrapper.readBoolean();
		this._minutesUntilMaintenance = wrapper.readInt();

		if (wrapper.bytesAvailable)
		{
			this._duration = wrapper.readInt();
		}

		return true;
	}
}
