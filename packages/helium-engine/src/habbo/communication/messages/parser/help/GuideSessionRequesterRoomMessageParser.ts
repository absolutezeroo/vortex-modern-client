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

    flush(): boolean
    {
        this._roomId = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._roomId = wrapper.readInt();

        return true;
    }
}
