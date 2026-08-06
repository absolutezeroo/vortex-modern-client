import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {ChatRecordData} from './ChatRecordData';

/**
 * Parser for room chatlog messages.
 *
 * @see source_as_win63/habbo/communication/messages/parser/moderation/RoomChatlogEventParser.as
 */
export class RoomChatlogMessageParser implements IMessageParser
{
    private _data: ChatRecordData | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/RoomChatlogEventParser.as::get data()
    get data(): ChatRecordData | null
    {
        return this._data;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/RoomChatlogEventParser.as::flush()
    flush(): boolean
    {
        this._data = null;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/RoomChatlogEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._data = new ChatRecordData(wrapper);

        return true;
    }
}
