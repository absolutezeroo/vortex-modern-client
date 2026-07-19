import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for respect notification message
 *
 * Parses the user ID and total respect count.
 *
 * @see source_as_win63/habbo/communication/messages/parser/users/RespectNotificationMessageEventParser.as
 */
export class RespectNotificationMessageEventParser implements IMessageParser
{
    private _userId: number = 0;

    get userId(): number
    {
        return this._userId;
    }

    private _respectTotal: number = 0;

    get respectTotal(): number
    {
        return this._respectTotal;
    }

    flush(): boolean
    {
        this._userId = 0;
        this._respectTotal = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._userId = wrapper.readInt();
        this._respectTotal = wrapper.readInt();

        return true;
    }
}
