/**
 * CloseConnectionMessageParser
 *
 * Based on AS3: com.sulake.habbo.communication.messages.parser.room.session.CloseConnectionMessageEventParser
 */
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

export class CloseConnectionMessageParser implements IMessageParser
{
    public flush(): boolean
    {
        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        return true;
    }
}
