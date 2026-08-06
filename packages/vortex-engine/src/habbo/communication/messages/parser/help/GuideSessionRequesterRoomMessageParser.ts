import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for guide session requester room messages.
 * Contains the room ID where the help requester is located.
 *
 * @see source_as_win63/habbo/communication/messages/parser/help/GuideSessionRequesterRoomMessageEventParser.as
 */
export class GuideSessionRequesterRoomMessageParser implements IMessageParser
{
    private _roomId: number = 0;

    get roomId(): number
    {
        return this._roomId;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideSessionRequesterRoomMessageEventParser.as::flush()
    flush(): boolean
    {
        this._roomId = 0;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideSessionRequesterRoomMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._roomId = wrapper.readInt();

        return true;
    }
}
