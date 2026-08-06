import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for hotel closed notification
 *
 * Parses the opening hour, opening minute, and whether the user was thrown out at close.
 *
 * @see source_as_win63/habbo/communication/messages/parser/availability/InfoHotelClosedMessageEventParser.as
 */
export class InfoHotelClosedMessageEventParser implements IMessageParser
{
    private _openHour: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/availability/InfoHotelClosedMessageEventParser.as::get openHour()
    get openHour(): number
    {
        return this._openHour;
    }

    private _openMinute: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/availability/InfoHotelClosedMessageEventParser.as::get openMinute()
    get openMinute(): number
    {
        return this._openMinute;
    }

    private _userThrownOutAtClose: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/parser/availability/InfoHotelClosedMessageEventParser.as::get userThrownOutAtClose()
    get userThrownOutAtClose(): boolean
    {
        return this._userThrownOutAtClose;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/availability/InfoHotelClosedMessageEventParser.as::flush()
    flush(): boolean
    {
        this._openHour = 0;
        this._openMinute = 0;
        this._userThrownOutAtClose = false;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/availability/InfoHotelClosedMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._openHour = wrapper.readInt();
        this._openMinute = wrapper.readInt();
        this._userThrownOutAtClose = wrapper.readBoolean();

        return true;
    }
}
