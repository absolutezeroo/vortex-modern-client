import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {ScrKickbackData} from '../../incoming/users/ScrKickbackData';

/**
 * ScrSendKickbackInfoMessageParser
 *
 * Based on AS3:
 * - com.sulake.habbo.communication.messages.parser.users.ScrSendKickbackInfoMessageEventParser
 * - com.sulake.habbo.communication.messages.parser.users.ScrSendKickbackInfoMessageParser
 */
export class ScrSendKickbackInfoMessageParser implements IMessageParser
{
    private _data: ScrKickbackData | null = null;

    get data(): ScrKickbackData | null
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

        this._data = new ScrKickbackData(wrapper);
        return true;
    }
}
