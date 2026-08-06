import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {PopularTagsData} from '../../incoming/navigator';

/**
 * Parser for popular room tags result message
 *
 * @see source_as_win63/habbo/communication/messages/parser/navigator/PopularRoomTagsResultEventParser.as
 */
export class PopularRoomTagsResultMessageParser implements IMessageParser
{
    private _data: PopularTagsData | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/PopularRoomTagsResultEventParser.as::get data()
    get data(): PopularTagsData | null
    {
        return this._data;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/PopularRoomTagsResultEventParser.as::flush()
    flush(): boolean
    {
        this._data = null;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/PopularRoomTagsResultEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._data = new PopularTagsData(wrapper);
        return true;
    }
}
