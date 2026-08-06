import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for pending calls for help deleted notification.
 * Empty message indicating all pending CFH tickets have been deleted.
 *
 * @see source_as_win63/habbo/communication/messages/parser/help/CallForHelpPendingCallsDeletedMessageEventParser.as
 */
export class CallForHelpPendingCallsDeletedMessageParser implements IMessageParser
{
    // AS3: sources/win63_version/habbo/communication/messages/parser/help/CallForHelpPendingCallsDeletedMessageEventParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/CallForHelpPendingCallsDeletedMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        return true;
    }
}
