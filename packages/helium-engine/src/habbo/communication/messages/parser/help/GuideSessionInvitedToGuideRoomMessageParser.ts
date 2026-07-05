import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for guide session invited to guide room messages.
 * Contains the room ID and name that the user is being invited to.
 *
 * @see source_as_win63/habbo/communication/messages/parser/help/GuideSessionInvitedToGuideRoomMessageEventParser.as
 */
export class GuideSessionInvitedToGuideRoomMessageParser implements IMessageParser
{
    private _roomId: number = 0;

    get roomId(): number
    {
        return this._roomId;
    }

    private _roomName: string = '';

    get roomName(): string
    {
        return this._roomName;
    }

    flush(): boolean
    {
        this._roomId = 0;
        this._roomName = '';
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._roomId = wrapper.readInt();
        this._roomName = wrapper.readString();

        return true;
    }
}
