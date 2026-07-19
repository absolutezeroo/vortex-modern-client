import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {PromoArticleData} from './PromoArticleData';

/**
 * Parser for promo articles message.
 * @see source_nitro_renderer/.../parser/landingview/PromoArticlesMessageParser.ts
 */
export class PromoArticlesMessageParser implements IMessageParser
{
    private _articles: PromoArticleData[] = [];

    get articles(): PromoArticleData[]
    {
        return this._articles;
    }

    flush(): boolean
    {
        this._articles = [];
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._articles.push(new PromoArticleData(wrapper));
        }

        return true;
    }
}
