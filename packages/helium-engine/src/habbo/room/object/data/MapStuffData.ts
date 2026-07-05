/**
 * MapStuffData
 *
 * Based on AS3: com.sulake.habbo.room.object.data.MapStuffData
 *
 * Key-value map based furniture data (format type 1).
 */
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IRoomObjectModel} from '@room/object/IRoomObjectModel';
import type {IRoomObjectModelController} from '@room/object/IRoomObjectModelController';
import {RoomObjectVariableEnum} from '../RoomObjectVariableEnum';
import type {IStuffData} from './IStuffData';
import {StuffDataBase} from './StuffDataBase';

export class MapStuffData extends StuffDataBase implements IStuffData
{
    public static readonly FORMAT_KEY = 1;

    private static readonly STATE_KEY = 'state';
    private static readonly RARITY_KEY = 'rarity';

    private _data: Map<string, string> = new Map();

    constructor(data?: Map<string, string>)
    {
        super();

        if(data)
        {
            this._data = data;
        }
    }

    override get rarityLevel(): number
    {
        const rarity = this._data.get(MapStuffData.RARITY_KEY);

        if(rarity)
        {
            return parseInt(rarity, 10);
        }

        return -1;
    }

    override initializeFromIncomingMessage(wrapper: IMessageDataWrapper): void
    {
        this._data = new Map();

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const key = wrapper.readString();
            const value = wrapper.readString();

            this._data.set(key, value);
        }

        super.initializeFromIncomingMessage(wrapper);
    }

    override initializeFromRoomObjectModel(model: IRoomObjectModel): void
    {
        super.initializeFromRoomObjectModel(model);
        this._data = model.getStringToStringMap(RoomObjectVariableEnum.FURNITURE_DATA);
    }

    override writeRoomObjectModel(model: IRoomObjectModelController): void
    {
        super.writeRoomObjectModel(model);
        model.setNumber(RoomObjectVariableEnum.FURNITURE_DATA_FORMAT, MapStuffData.FORMAT_KEY);
        model.setStringToStringMap(RoomObjectVariableEnum.FURNITURE_DATA, this._data);
    }

    override getLegacyString(): string
    {
        const state = this._data.get(MapStuffData.STATE_KEY);

        if(state !== undefined)
        {
            return state;
        }

        return '';
    }

    override compare(_data: IStuffData): boolean
    {
        return false;
    }

    getValue(key: string): string | null
    {
        return this._data.get(key) ?? null;
    }
}
