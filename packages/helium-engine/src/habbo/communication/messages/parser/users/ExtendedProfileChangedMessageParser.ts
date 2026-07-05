import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * ExtendedProfileChangedMessageParser
 *
 * Based on AS3:
 * - com.sulake.habbo.communication.messages.parser.users.ExtendedProfileChangedMessageEventParser
 * - com.sulake.habbo.communication.messages.parser.users.ExtendedProfileChangedMessageParser
 */
export class ExtendedProfileChangedMessageParser implements IMessageParser
{
    private _userId: number = 0;

    get userId(): number
    {
        return this._userId;
    }

    flush(): boolean
    {
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._userId = wrapper.readInt();
        return true;
    }
}
