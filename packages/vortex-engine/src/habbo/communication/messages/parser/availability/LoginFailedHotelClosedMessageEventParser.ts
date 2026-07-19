import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for login failed hotel closed message
 *
 * @see source_as_win63/habbo/communication/messages/parser/availability/LoginFailedHotelClosedMessageEventParser.as
 */
export class LoginFailedHotelClosedMessageEventParser implements IMessageParser
{
    private _openHour: number = 0;

    get openHour(): number
    {
        return this._openHour;
    }

    private _openMinute: number = 0;

    get openMinute(): number
    {
        return this._openMinute;
    }

    flush(): boolean
    {
        this._openHour = 0;
        this._openMinute = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._openHour = wrapper.readInt();
        this._openMinute = wrapper.readInt();
        return true;
    }
}
