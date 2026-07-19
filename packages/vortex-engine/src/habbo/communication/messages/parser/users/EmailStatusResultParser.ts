import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parser for email status result message
 *
 * @see source_as_win63/habbo/communication/messages/parser/users/EmailStatusResultEventParser.as
 */
export class EmailStatusResultParser implements IMessageParser
{
    private _email: string = '';

    get email(): string
    {
        return this._email;
    }

    private _isVerified: boolean = false;

    get isVerified(): boolean
    {
        return this._isVerified;
    }

    private _allowChange: boolean = false;

    get allowChange(): boolean
    {
        return this._allowChange;
    }

    flush(): boolean
    {
        this._email = '';
        this._isVerified = false;
        this._allowChange = false;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._email = wrapper.readString();
        this._isVerified = wrapper.readBoolean();
        this._allowChange = wrapper.readBoolean();

        return true;
    }
}
