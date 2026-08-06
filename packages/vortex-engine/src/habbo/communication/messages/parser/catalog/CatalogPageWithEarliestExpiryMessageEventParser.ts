import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parses the soonest-expiring catalog page's data.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPageWithEarliestExpiryMessageEventParser.as
 */
export class CatalogPageWithEarliestExpiryMessageEventParser implements IMessageParser
{
    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPageWithEarliestExpiryMessageEventParser.as::_pageName
    private _pageName: string = '';
    private _secondsToExpiry: number = 0;
    private _image: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPageWithEarliestExpiryMessageEventParser.as::flush()
    flush(): boolean
    {
        this._pageName = '';
        this._secondsToExpiry = 0;
        this._image = '';
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPageWithEarliestExpiryMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._pageName = wrapper.readString();
        this._secondsToExpiry = wrapper.readInt();
        this._image = wrapper.readString();
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPageWithEarliestExpiryMessageEventParser.as::get pageName()
    get pageName(): string
    {
        return this._pageName;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPageWithEarliestExpiryMessageEventParser.as::get secondsToExpiry()
    get secondsToExpiry(): number
    {
        return this._secondsToExpiry;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPageWithEarliestExpiryMessageEventParser.as::get image()
    get image(): string
    {
        return this._image;
    }
}
