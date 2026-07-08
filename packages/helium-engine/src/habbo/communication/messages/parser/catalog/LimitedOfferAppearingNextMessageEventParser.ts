import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parses the next limited-edition rare's appearance countdown data.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/catalog/LimitedOfferAppearingNextMessageEventParser.as
 */
export class LimitedOfferAppearingNextMessageEventParser implements IMessageParser
{
    private _appearsInSeconds: number = -1;
    private _pageId: number = -1;
    private _offerId: number = -1;
    private _productType: string = '';

    flush(): boolean
    {
        this._appearsInSeconds = -1;
        this._pageId = -1;
        this._offerId = -1;
        this._productType = '';
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._appearsInSeconds = wrapper.readInt();
        this._pageId = wrapper.readInt();
        this._offerId = wrapper.readInt();
        this._productType = wrapper.readString();
        return true;
    }

    get appearsInSeconds(): number
    {
        return this._appearsInSeconds;
    }

    get pageId(): number
    {
        return this._pageId;
    }

    get offerId(): number
    {
        return this._offerId;
    }

    get productType(): string
    {
        return this._productType;
    }
}
