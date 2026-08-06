import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * @see sources/win63_version/habbo/communication/messages/parser/catalog/VoucherRedeemOkMessageEventParser.as
 */
export class VoucherRedeemOkMessageEventParser implements IMessageParser
{
    private _productDescription: string = '';
    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/VoucherRedeemOkMessageEventParser.as::_productName
    private _productName: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/VoucherRedeemOkMessageEventParser.as::get productName()
    get productName(): string
    {
        return this._productName;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/VoucherRedeemOkMessageEventParser.as::get productDescription()
    get productDescription(): string
    {
        return this._productDescription;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/VoucherRedeemOkMessageEventParser.as::flush()
    flush(): boolean
    {
        this._productDescription = '';
        this._productName = '';

        return true;
    }

    // AS3 reads productDescription before productName - preserve wire order exactly.
    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/VoucherRedeemOkMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._productDescription = wrapper.readString();
        this._productName = wrapper.readString();

        return true;
    }
}
