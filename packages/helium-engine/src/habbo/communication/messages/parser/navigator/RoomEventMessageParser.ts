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

    get data(): RoomEventData | null
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
        this._data = new RoomEventData(wrapper);
        return true;
    }
}
