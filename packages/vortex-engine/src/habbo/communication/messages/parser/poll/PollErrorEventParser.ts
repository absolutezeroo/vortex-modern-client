import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for poll error events
 *
 * @see source_as_win63/habbo/communication/messages/parser/poll/PollErrorEventParser.as
 */
export class PollErrorEventParser implements IMessageParser
{
    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/PollErrorEventParser.as::flush()
    flush(): boolean
    {
        return false;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/PollErrorEventParser.as::parse()
    parse(_wrapper: IMessageDataWrapper): boolean
    {
        return false;
    }
}
