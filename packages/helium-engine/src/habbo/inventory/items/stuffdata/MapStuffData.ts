import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {StuffDataBase} from './StuffDataBase';

/**
 * Map stuff data - key-value pairs
 *
 * Based on AS3 com.sulake.habbo.room.object.data.MapStuffData
 */
export class MapStuffData extends StuffDataBase
{
    public static readonly FORMAT_KEY = 1;
    public static readonly STATE_KEY = 'state';
    public static readonly RARITY_KEY = 'rarity';

    private _data: Map<string, string> = new Map();

    get data(): Map<string, string>
    {
        return this._data;
    }

    override get rarityLevel(): number
    {
        const rarity = this._data.get(MapStuffData.RARITY_KEY);

        return rarity ? parseInt(rarity, 10) : -1;
    }

    override initializeFromIncomingMessage(wrapper: IMessageDataWrapper): void
    {
        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const key = wrapper.readString();
            const value = wrapper.readString();

            this._data.set(key, value);
        }

        super.initializeFromIncomingMessage(wrapper);
    }

    override getLegacyString(): string
    {
        return this._data.get(MapStuffData.STATE_KEY) ?? '';
    }

    getValue(key: string): string | null
    {
        return this._data.get(key) ?? null;
    }

    setValue(key: string, value: string): void
    {
        this._data.set(key, value);
    }
}
