import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {CategoriesWithVisitorCountData} from '../../incoming/navigator';

/**
 * Parser for categories with visitor count message
 *
 * @see source_as_win63/habbo/communication/messages/parser/navigator/CategoriesWithVisitorCountEventParser.as
 */
export class CategoriesWithVisitorCountMessageParser implements IMessageParser
{
    private _data: CategoriesWithVisitorCountData | null = null;

    get data(): CategoriesWithVisitorCountData | null
    {
        return this._data;
    }

    flush(): boolean
    {
        this._data = null;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._data = new CategoriesWithVisitorCountData(wrapper);
        return true;
    }
}
