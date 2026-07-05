import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {StuffDataBase} from './StuffDataBase';

/**
 * Vote result stuff data
 *
 * Based on AS3 com.sulake.habbo.room.object.data.VoteResultStuffData
 */
export class VoteResultStuffData extends StuffDataBase
{
    public static readonly FORMAT_KEY = 3;

    private _state: string = '';
    private _result: number = 0;

    get result(): number
    {
        return this._result;
    }

    override initializeFromIncomingMessage(wrapper: IMessageDataWrapper): void
    {
        this._state = wrapper.readString();
        this._result = wrapper.readInt();

        super.initializeFromIncomingMessage(wrapper);
    }

    override getLegacyString(): string
    {
        return this._state;
    }
}
