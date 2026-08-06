import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for room event cancel message
 *
 * @see source_as_win63/habbo/communication/messages/parser/navigator/RoomEventCancelEventParser.as
 */
export class RoomEventCancelMessageParser implements IMessageParser
{
    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/RoomEventCancelEventParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/RoomEventCancelEventParser.as::parse()
    parse(_wrapper: IMessageDataWrapper): boolean
    {
        // No data to parse
        return true;
    }
}
