import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {StuffDataBase} from './StuffDataBase';

/**
 * String array stuff data
 *
 * Based on AS3 com.sulake.habbo.room.object.data.StringArrayStuffData
 */
export class StringArrayStuffData extends StuffDataBase
{
	public static readonly FORMAT_KEY = 2;

	private _data: string[] = [];

	get data(): string[]
	{
		return this._data;
	}

	override initializeFromIncomingMessage(wrapper: IMessageDataWrapper): void
	{
		const count = wrapper.readInt();

		for (let i = 0; i < count; i++)
		{
			this._data.push(wrapper.readString());
		}

		super.initializeFromIncomingMessage(wrapper);
	}

	override getLegacyString(): string
	{
		return this._data[0] ?? '';
	}

	getValue(index: number): string | null
	{
		return this._data[index] ?? null;
	}
}
