import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {ClubGiftProductData} from '../../incoming/notifications/ClubGiftProductData';

/**
 * Parser for club gift selected event
 *
 * Parses the selected product code and the list of products.
 *
 * @see source_as_win63/habbo/communication/messages/parser/catalog/ClubGiftSelectedEventParser.as
 */
export class ClubGiftSelectedEventParser implements IMessageParser
{
    private _productCode: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/ClubGiftSelectedEventParser.as::get productCode()
    get productCode(): string
    {
        return this._productCode;
    }

    private _products: ClubGiftProductData[] = [];

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/ClubGiftSelectedEventParser.as::get products()
    get products(): ClubGiftProductData[]
    {
        return this._products;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/ClubGiftSelectedEventParser.as::flush()
    flush(): boolean
    {
        this._productCode = '';
        this._products = [];
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/ClubGiftSelectedEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._products = [];
        this._productCode = wrapper.readString();

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._products.push(new ClubGiftProductData(wrapper));
        }

        return true;
    }
}
