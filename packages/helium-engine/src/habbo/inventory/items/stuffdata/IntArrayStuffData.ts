import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {StuffDataBase} from './StuffDataBase';

/**
 * Int array stuff data
 *
 * Based on AS3 com.sulake.habbo.room.object.data.IntArrayStuffData
 */
export class IntArrayStuffData extends StuffDataBase
{
    public static readonly FORMAT_KEY = 5;

    private _data: number[] = [];

    get data(): number[]
    {
        return this._data;
    }

    override initializeFromIncomingMessage(wrapper: IMessageDataWrapper): void
    {
        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._data.push(wrapper.readInt());
        }

        super.initializeFromIncomingMessage(wrapper);
    }

    override getLegacyString(): string
    {
        return this._data[0]?.toString() ?? '';
    }

    getValue(index: number): number | null
    {
        return this._data[index] ?? null;
    }
}
