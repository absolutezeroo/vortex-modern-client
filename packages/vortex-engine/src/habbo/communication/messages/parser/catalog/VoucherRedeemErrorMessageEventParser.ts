import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * @see sources/win63_version/habbo/communication/messages/parser/catalog/VoucherRedeemErrorMessageEventParser.as
 */
export class VoucherRedeemErrorMessageEventParser implements IMessageParser
{
    private _errorCode: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/VoucherRedeemErrorMessageEventParser.as::get errorCode()
    get errorCode(): string
    {
        return this._errorCode;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/VoucherRedeemErrorMessageEventParser.as::flush()
    flush(): boolean
    {
        this._errorCode = '';

        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/VoucherRedeemErrorMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._errorCode = wrapper.readString();

        return true;
    }
}
