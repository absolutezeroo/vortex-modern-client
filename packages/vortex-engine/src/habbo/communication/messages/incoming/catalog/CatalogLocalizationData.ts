import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Localization asset lists (image URIs + text keys) for a catalog page.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/class_2409.as
 */
export class CatalogLocalizationData
{
    private _images: string[] = [];

    get images(): string[]
    {
        return this._images;
    }

    private _texts: string[] = [];

    get texts(): string[]
    {
        return this._texts;
    }

    constructor(wrapper: IMessageDataWrapper)
    {
        this._images = [];

        const imageCount = wrapper.readInt();

        for(let i = 0; i < imageCount; i++)
        {
            this._images.push(wrapper.readString());
        }

        this._texts = [];

        const textCount = wrapper.readInt();

        for(let i = 0; i < textCount; i++)
        {
            this._texts.push(wrapper.readString());
        }
    }
}
