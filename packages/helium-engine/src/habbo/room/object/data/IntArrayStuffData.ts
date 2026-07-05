/**
 * IntArrayStuffData
 *
 * Based on AS3: com.sulake.habbo.room.object.data.IntArrayStuffData
 *
 * Integer array based furniture data (format type 5).
 */
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IRoomObjectModel} from '@room/object/IRoomObjectModel';
import type {IRoomObjectModelController} from '@room/object/IRoomObjectModelController';
import {RoomObjectVariableEnum} from '../RoomObjectVariableEnum';
import type {IStuffData} from './IStuffData';
import {StuffDataBase} from './StuffDataBase';

export class IntArrayStuffData extends StuffDataBase implements IStuffData
{
    public static readonly FORMAT_KEY = 5;

    private _data: number[] = [];

    get length(): number
    {
        return this._data.length;
    }

    override initializeFromIncomingMessage(wrapper: IMessageDataWrapper): void
    {
        this._data = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._data.push(wrapper.readInt());
        }

        super.initializeFromIncomingMessage(wrapper);
    }

    override initializeFromRoomObjectModel(model: IRoomObjectModel): void
    {
        super.initializeFromRoomObjectModel(model);

        const data = model.getNumberArray(RoomObjectVariableEnum.FURNITURE_DATA);
        this._data = data ? [...data] : [];
    }

    override writeRoomObjectModel(model: IRoomObjectModelController): void
    {
        super.writeRoomObjectModel(model);
        model.setNumber(RoomObjectVariableEnum.FURNITURE_DATA_FORMAT, IntArrayStuffData.FORMAT_KEY);
        model.setNumberArray(RoomObjectVariableEnum.FURNITURE_DATA, this._data);
    }

    override getLegacyString(): string
    {
        if(this._data.length > 0)
        {
            return String(this._data[0]);
        }

        return '';
    }

    override compare(data: IStuffData): boolean
    {
        return this.getLegacyString() === data.getLegacyString();
    }

    getValue(index: number): number
    {
        if(index >= 0 && index < this._data.length)
        {
            return this._data[index];
        }

        return 0;
    }
}
