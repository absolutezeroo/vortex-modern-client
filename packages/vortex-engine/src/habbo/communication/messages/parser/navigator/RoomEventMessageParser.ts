import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {RoomEventData} from '../../incoming/navigator';

/**
 * Parser for room event message
 *
 * @see source_as_win63/habbo/communication/messages/parser/navigator/RoomEventEventParser.as
 */
export class RoomEventMessageParser implements IMessageParser
{
    private _data: RoomEventData | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/RoomEventEventParser.as::get data()
    get data(): RoomEventData | null
    {
        return this._data;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/RoomEventEventParser.as::flush()
    flush(): boolean
    {
        this._data = null;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/RoomEventEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._data = new RoomEventData(wrapper);
        return true;
    }
}
