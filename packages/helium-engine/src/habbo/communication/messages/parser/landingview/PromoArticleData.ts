import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Data for a single promo article on the landing page.
 * @see source_nitro_renderer/.../parser/landingview/PromoArticleData.ts
 */
export class PromoArticleData
{
    static readonly LINK_TYPE_URL = 0;
    static readonly LINK_TYPE_INTERNAL = 1;
    static readonly LINK_TYPE_NO_LINK = 2;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._id = wrapper.readInt();
        this._title = wrapper.readString();
        this._bodyText = wrapper.readString();
        this._buttonText = wrapper.readString();
        this._linkType = wrapper.readInt();
        this._linkContent = wrapper.readString();
        this._imageUrl = wrapper.readString();
    }

    private _id: number;

    get id(): number
    {
        return this._id;
    }

    private _title: string;

    get title(): string
    {
        return this._title;
    }

    private _bodyText: string;

    get bodyText(): string
    {
        return this._bodyText;
    }

    private _buttonText: string;

    get buttonText(): string
    {
        return this._buttonText;
    }

    private _linkType: number;

    get linkType(): number
    {
        return this._linkType;
    }

    private _linkContent: string;

    get linkContent(): string
    {
        return this._linkContent;
    }

    private _imageUrl: string;

    get imageUrl(): string
    {
        return this._imageUrl;
    }
}
