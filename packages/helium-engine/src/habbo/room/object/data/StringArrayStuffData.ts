/**
 * StringArrayStuffData
 *
 * Based on AS3: com.sulake.habbo.room.object.data.StringArrayStuffData
 *
 * String array based furniture data (format type 2).
 */
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IRoomObjectModel} from '@room/object/IRoomObjectModel';
import type {IRoomObjectModelController} from '@room/object/IRoomObjectModelController';
import {RoomObjectVariableEnum} from '../RoomObjectVariableEnum';
import type {IStuffData} from './IStuffData';
import {StuffDataBase} from './StuffDataBase';

export class StringArrayStuffData extends StuffDataBase implements IStuffData
{
	public static readonly FORMAT_KEY = 2;

	private _data: string[] = [];

	get length(): number
	{
		return this._data.length;
	}

	override initializeFromIncomingMessage(wrapper: IMessageDataWrapper): void
	{
		this._data = [];

		const count = wrapper.readInt();

		for (let i = 0; i < count; i++)
		{
			this._data.push(wrapper.readString());
		}

		super.initializeFromIncomingMessage(wrapper);
	}

	override initializeFromRoomObjectModel(model: IRoomObjectModel): void
	{
		super.initializeFromRoomObjectModel(model);

		const data = model.getStringArray(RoomObjectVariableEnum.FURNITURE_DATA);
		this._data = data ? [...data] : [];
	}

	override writeRoomObjectModel(model: IRoomObjectModelController): void
	{
		super.writeRoomObjectModel(model);
		model.setNumber(RoomObjectVariableEnum.FURNITURE_DATA_FORMAT, StringArrayStuffData.FORMAT_KEY);
		model.setStringArray(RoomObjectVariableEnum.FURNITURE_DATA, this._data);
	}

	override getLegacyString(): string
	{
		if (this._data.length > 0)
		{
			return this._data[0];
		}

		return '';
	}

	override compare(data: IStuffData): boolean
	{
		return this.getLegacyString() === data.getLegacyString();
	}

	getValue(index: number): string
	{
		if (index >= 0 && index < this._data.length)
		{
			return this._data[index];
		}

		return '';
	}
}
