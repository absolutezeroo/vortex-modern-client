import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parses the user's credit balance.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/inventory/purse/CreditBalanceEventParser.as
 */
export class CreditBalanceEventParser implements IMessageParser
{
    private _balance: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/purse/CreditBalanceEventParser.as::get balance()
    get balance(): number { return this._balance; }

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/purse/CreditBalanceEventParser.as::flush()
    flush(): boolean
    {
        this._balance = 0;

        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/purse/CreditBalanceEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._balance = parseInt(wrapper.readString(), 10);

        if(Number.isNaN(this._balance))
        {
            this._balance = 0;
        }

        return true;
    }
}
