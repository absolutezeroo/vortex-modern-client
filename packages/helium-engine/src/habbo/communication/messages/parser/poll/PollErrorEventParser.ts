import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for poll error events
 *
 * @see source_as_win63/habbo/communication/messages/parser/poll/PollErrorEventParser.as
 */
export class PollErrorEventParser implements IMessageParser
{
    flush(): boolean
    {
        return false;
    }

    parse(_wrapper: IMessageDataWrapper): boolean
    {
        return false;
    }
}
