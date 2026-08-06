import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for hotel closing notification
 *
 * Parses the number of minutes until the hotel closes.
 *
 * @see source_as_win63/habbo/communication/messages/parser/availability/InfoHotelClosingMessageEventParser.as
 */
export class InfoHotelClosingMessageEventParser implements IMessageParser
{
    private _minutesUntilClosing: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/availability/InfoHotelClosingMessageEventParser.as::get minutesUntilClosing()
    get minutesUntilClosing(): number
    {
        return this._minutesUntilClosing;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/availability/InfoHotelClosingMessageEventParser.as::flush()
    flush(): boolean
    {
        this._minutesUntilClosing = 0;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/availability/InfoHotelClosingMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._minutesUntilClosing = wrapper.readInt();

        return true;
    }
}
