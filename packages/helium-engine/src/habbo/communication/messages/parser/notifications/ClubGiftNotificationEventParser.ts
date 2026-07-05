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

    get numGifts(): number
    {
        return this._numGifts;
    }

    flush(): boolean
    {
        this._numGifts = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._numGifts = wrapper.readInt();

        return true;
    }
}
