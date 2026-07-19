import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for info feed enable message
 *
 * @see source_as_win63/habbo/communication/messages/parser/notifications/InfoFeedEnableMessageEventParser.as
 */
export class InfoFeedEnableMessageParser implements IMessageParser
{
    private _enabled: boolean = false;

    get enabled(): boolean
    {
        return this._enabled;
    }

    flush(): boolean
    {
        this._enabled = false;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._enabled = wrapper.readBoolean();
        return true;
    }
}
