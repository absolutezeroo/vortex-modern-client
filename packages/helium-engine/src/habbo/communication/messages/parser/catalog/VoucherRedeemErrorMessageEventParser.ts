import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * @see sources/win63_version/habbo/communication/messages/parser/catalog/VoucherRedeemErrorMessageEventParser.as
 */
export class VoucherRedeemErrorMessageEventParser implements IMessageParser
{
    private _errorCode: string = '';

    get errorCode(): string
    {
        return this._errorCode;
    }

    flush(): boolean
    {
        this._errorCode = '';

        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._errorCode = wrapper.readString();

        return true;
    }
}
