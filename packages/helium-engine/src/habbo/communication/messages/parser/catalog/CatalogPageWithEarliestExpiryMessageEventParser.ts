import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parses the soonest-expiring catalog page's data.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPageWithEarliestExpiryMessageEventParser.as
 */
export class CatalogPageWithEarliestExpiryMessageEventParser implements IMessageParser
{
    private _pageName: string = '';
    private _secondsToExpiry: number = 0;
    private _image: string = '';

    flush(): boolean
    {
        this._pageName = '';
        this._secondsToExpiry = 0;
        this._image = '';
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._pageName = wrapper.readString();
        this._secondsToExpiry = wrapper.readInt();
        this._image = wrapper.readString();
        return true;
    }

    get pageName(): string
    {
        return this._pageName;
    }

    get secondsToExpiry(): number
    {
        return this._secondsToExpiry;
    }

    get image(): string
    {
        return this._image;
    }
}
