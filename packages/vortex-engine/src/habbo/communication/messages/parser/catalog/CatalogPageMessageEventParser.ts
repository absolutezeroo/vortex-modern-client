import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {CatalogLocalizationData} from '../../incoming/catalog/CatalogLocalizationData';
import {ClubOfferData} from './ClubOfferData';
import {FrontPageItem} from '../../incoming/catalog/FrontPageItem';

/**
 * Parser for a catalog page's contents (offers + localization + optional front-page items).
 *
 * @see sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPageMessageEventParser.as
 */
export class CatalogPageMessageEventParser implements IMessageParser
{
    private _pageId: number = -1;

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPageMessageEventParser.as::get pageId()
    get pageId(): number
    {
        return this._pageId;
    }

    private _catalogType: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPageMessageEventParser.as::get catalogType()
    get catalogType(): string
    {
        return this._catalogType;
    }

    private _layoutCode: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPageMessageEventParser.as::get layoutCode()
    get layoutCode(): string
    {
        return this._layoutCode;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPageMessageEventParser.as::_localization
    private _localization: CatalogLocalizationData | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPageMessageEventParser.as::get localization()
    get localization(): CatalogLocalizationData | null
    {
        return this._localization;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPageMessageEventParser.as::_offers
    private _offers: ClubOfferData[] = [];

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPageMessageEventParser.as::get offers()
    get offers(): ClubOfferData[]
    {
        return this._offers;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPageMessageEventParser.as::_offerId
    private _offerId: number = -1;

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPageMessageEventParser.as::get offerId()
    get offerId(): number
    {
        return this._offerId;
    }

    private _acceptSeasonCurrencyAsCredits: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPageMessageEventParser.as::get acceptSeasonCurrencyAsCredits()
    get acceptSeasonCurrencyAsCredits(): boolean
    {
        return this._acceptSeasonCurrencyAsCredits;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPageMessageEventParser.as::_frontPageItems
    private _frontPageItems: FrontPageItem[] | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPageMessageEventParser.as::get frontPageItems()
    get frontPageItems(): FrontPageItem[] | null
    {
        return this._frontPageItems;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPageMessageEventParser.as::flush()
    flush(): boolean
    {
        this._pageId = -1;
        this._catalogType = '';
        this._layoutCode = '';
        this._localization = null;
        this._offers = [];
        this._offerId = -1;
        this._acceptSeasonCurrencyAsCredits = false;

        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/CatalogPageMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._pageId = wrapper.readInt();
        this._catalogType = wrapper.readString();
        this._layoutCode = wrapper.readString();
        this._localization = new CatalogLocalizationData(wrapper);

        this._offers = [];

        const offerCount = wrapper.readInt();

        for(let i = 0; i < offerCount; i++)
        {
            this._offers.push(new ClubOfferData(wrapper));
        }

        this._offerId = wrapper.readInt();
        this._acceptSeasonCurrencyAsCredits = wrapper.readBoolean();

        if(wrapper.bytesAvailable)
        {
            this._frontPageItems = [];

            const frontPageItemCount = wrapper.readInt();

            for(let i = 0; i < frontPageItemCount; i++)
            {
                this._frontPageItems.push(new FrontPageItem(wrapper));
            }
        }

        return true;
    }
}
