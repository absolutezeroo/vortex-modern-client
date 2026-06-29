import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {StuffDataBase} from './StuffDataBase';

/**
 * Legacy stuff data - simple string state
 *
 * Based on AS3 com.sulake.habbo.room.object.data.LegacyStuffData
 */
export class LegacyStuffData extends StuffDataBase
{
	public static readonly FORMAT_KEY = 0;

	private _data: string = '';

	override initializeFromIncomingMessage(wrapper: IMessageDataWrapper): void
	{
		this._data = wrapper.readString();

		super.initializeFromIncomingMessage(wrapper);
	}

	override getLegacyString(): string
	{
		return this._data;
	}

	setString(value: string): void
	{
		this._data = value;
	}
}
