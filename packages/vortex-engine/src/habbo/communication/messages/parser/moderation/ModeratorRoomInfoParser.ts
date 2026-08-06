import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {ModeratorRoomInfoData} from './ModeratorRoomInfoData';

/**
 * Parser for moderator room info messages.
 *
 * @see source_as_win63/habbo/communication/messages/parser/moderation/ModeratorRoomInfoEventParser.as
 */
export class ModeratorRoomInfoParser implements IMessageParser
{
    private _data: ModeratorRoomInfoData | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/ModeratorRoomInfoEventParser.as::get data()
    get data(): ModeratorRoomInfoData | null
    {
        return this._data;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/ModeratorRoomInfoEventParser.as::flush()
    flush(): boolean
    {
        this._data = null;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/ModeratorRoomInfoEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._data = new ModeratorRoomInfoData(wrapper);

        return true;
    }
}
