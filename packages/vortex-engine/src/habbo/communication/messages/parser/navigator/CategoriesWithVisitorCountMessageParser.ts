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

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/CategoriesWithVisitorCountEventParser.as::get data()
    get data(): CategoriesWithVisitorCountData | null
    {
        return this._data;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/CategoriesWithVisitorCountEventParser.as::flush()
    flush(): boolean
    {
        this._data = null;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/CategoriesWithVisitorCountEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._data = new CategoriesWithVisitorCountData(wrapper);
        return true;
    }
}
