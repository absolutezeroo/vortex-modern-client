import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {HabboGroupDetailsData} from '../../incoming/users/HabboGroupDetailsData';

/**
 * HabboGroupDetailsMessageParser
 *
 * Based on AS3:
 * - com.sulake.habbo.communication.messages.parser.users.HabboGroupDetailsMessageEventParser
 * - com.sulake.habbo.communication.messages.parser.users.HabboGroupDetailsMessageParser
 */
export class HabboGroupDetailsMessageParser implements IMessageParser
{
    private _data: HabboGroupDetailsData | null = null;

    get data(): HabboGroupDetailsData | null
    {
        return this._data;
    }

    flush(): boolean
    {
        this._data = null;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._data = new HabboGroupDetailsData(wrapper);
        return true;
    }
}
