import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for club gift notification
 *
 * Parses the number of available club gifts.
 *
 * @see source_as_win63/habbo/communication/messages/parser/notifications/ClubGiftNotificationEventParser.as
 */
export class ClubGiftNotificationEventParser implements IMessageParser
{
    private _numGifts: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/notifications/ClubGiftNotificationEventParser.as::get numGifts()
    get numGifts(): number
    {
        return this._numGifts;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/notifications/ClubGiftNotificationEventParser.as::flush()
    flush(): boolean
    {
        this._numGifts = 0;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/notifications/ClubGiftNotificationEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._numGifts = wrapper.readInt();

        return true;
    }
}
