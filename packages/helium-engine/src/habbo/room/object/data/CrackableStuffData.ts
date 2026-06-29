/**
 * CrackableStuffData
 *
 * Based on AS3: com.sulake.habbo.room.object.data.CrackableStuffData
 *
 * Crackable furniture data (format type 7).
 */
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IRoomObjectModel} from '@room/object/IRoomObjectModel';
import type {IRoomObjectModelController} from '@room/object/IRoomObjectModelController';
import {RoomObjectVariableEnum} from '../RoomObjectVariableEnum';
import type {IStuffData} from './IStuffData';
import {StuffDataBase} from './StuffDataBase';

export class CrackableStuffData extends StuffDataBase implements IStuffData
{
	public static readonly FORMAT_KEY = 7;

	private _state: string = '';
	private _hits: number = 0;

	get hits(): number
	{
		return this._hits;
	}

	private _target: number = 0;

	get target(): number
	{
		return this._target;
	}

	override initializeFromIncomingMessage(wrapper: IMessageDataWrapper): void
	{
		this._state = wrapper.readString();
		this._hits = wrapper.readInt();
		this._target = wrapper.readInt();
		super.initializeFromIncomingMessage(wrapper);
	}

	override initializeFromRoomObjectModel(model: IRoomObjectModel): void
	{
		super.initializeFromRoomObjectModel(model);
		this._state = model.getString(RoomObjectVariableEnum.FURNITURE_DATA);
	}

	override writeRoomObjectModel(model: IRoomObjectModelController): void
	{
		super.writeRoomObjectModel(model);
		model.setNumber(RoomObjectVariableEnum.FURNITURE_DATA_FORMAT, CrackableStuffData.FORMAT_KEY);
		model.setString(RoomObjectVariableEnum.FURNITURE_DATA, this._state);
	}

	override getLegacyString(): string
	{
		return this._state;
	}

	override compare(data: IStuffData): boolean
	{
		return this._state === data.getLegacyString();
	}
}
