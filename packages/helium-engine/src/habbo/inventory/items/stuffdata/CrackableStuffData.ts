import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {StuffDataBase} from './StuffDataBase';

/**
 * Crackable stuff data (for items that break after hits)
 *
 * Based on AS3 com.sulake.habbo.room.object.data.CrackableStuffData
 */
export class CrackableStuffData extends StuffDataBase
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

    override getLegacyString(): string
    {
        return this._state;
    }
}
