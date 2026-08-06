import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parser for FurniListInvalidate message (inventory needs refresh)
 *
 * @see source_as_win63/habbo/communication/messages/parser/inventory/furni/FurniListInvalidateEventParser.as
 */
export class FurniListInvalidateMessageParser implements IMessageParser
{
    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/furni/FurniListInvalidateEventParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/furni/FurniListInvalidateEventParser.as::parse()
    parse(_wrapper: IMessageDataWrapper): boolean
    {
        // No data to parse
        return true;
    }
}
