import type {IMessageDataWrapper} from '@core/communication';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {NavigatorSearchResultSet} from '../../incoming/newnavigator';

/**
 * Parser for a navigator search result set
 *
 * @see source_as_win63/habbo/communication/messages/parser/newnavigator/class_1145.as
 */
export class NavigatorSearchResultSetMessageParser implements IMessageParser
{
    private _searchResult: NavigatorSearchResultSet | null = null;

    get searchResult(): NavigatorSearchResultSet | null
    {
        return this._searchResult;
    }

    flush(): boolean
    {
        this._searchResult = null;

        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._searchResult = new NavigatorSearchResultSet(wrapper);

        return true;
    }
}
