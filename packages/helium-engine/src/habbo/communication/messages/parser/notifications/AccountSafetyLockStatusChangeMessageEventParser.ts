import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for account safety lock status change message
 *
 * Parses the safety lock status code.
 *
 * @see source_as_win63/habbo/communication/messages/parser/users/AccountSafetyLockStatusChangeMessageEventParser.as
 */
export class AccountSafetyLockStatusChangeMessageEventParser implements IMessageParser
{
    public static readonly UNLOCKED: number = 0;
    public static readonly LOCKED: number = 1;

    private _status: number = 0;

    get status(): number
    {
        return this._status;
    }

    flush(): boolean
    {
        this._status = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._status = wrapper.readInt();

        return true;
    }
}
