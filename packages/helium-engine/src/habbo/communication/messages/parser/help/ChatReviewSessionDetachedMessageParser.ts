import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parses chat review session detached data from the server.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/help/ChatReviewSessionDetachedMessageEventParser.as
 */
export class ChatReviewSessionDetachedMessageParser implements IMessageParser
{
    flush(): boolean
    {
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        return true;
    }
}
