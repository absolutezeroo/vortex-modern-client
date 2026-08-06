import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for guide session detached messages.
 * Empty message indicating that the guide session has been detached.
 *
 * @see source_as_win63/habbo/communication/messages/parser/help/GuideSessionDetachedMessageEventParser.as
 */
export class GuideSessionDetachedMessageParser implements IMessageParser
{
    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideSessionDetachedMessageEventParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideSessionDetachedMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        return true;
    }
}
