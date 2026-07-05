import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests promo articles for the landing view.
 * @see source_nitro_renderer/.../outgoing/landingview/GetPromoArticlesComposer.ts
 */
export class GetPromoArticlesComposer extends MessageComposer<ConstructorParameters<typeof GetPromoArticlesComposer>>
{
    private _data: ConstructorParameters<typeof GetPromoArticlesComposer>;

    constructor()
    {
        super();
        this._data = [];
    }

    getMessageArray()
    {
        return this._data;
    }
}
