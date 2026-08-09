/**
 * RoomWidgetChatInputContentUpdateEvent
 *
 * @see sources/win63_version/habbo/ui/widget/events/RoomWidgetChatInputContentUpdateEvent.as
 */
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

export class RoomWidgetChatInputContentUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetChatInputContentUpdateEvent.as::CHAT_INPUT_CONTENT
    public static readonly CHAT_INPUT_CONTENT: string = 'RWWCIDE_CHAT_INPUT_CONTENT';
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetChatInputContentUpdateEvent.as::MESSAGE_TYPE_WHISPER
    public static readonly MESSAGE_TYPE_WHISPER: string = 'whisper';
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetChatInputContentUpdateEvent.as::MESSAGE_TYPE_SHOUT
    public static readonly MESSAGE_TYPE_SHOUT: string = 'shout';

    private _messageType: string;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetChatInputContentUpdateEvent.as::_userName
    private _userName: string;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetChatInputContentUpdateEvent.as::RoomWidgetChatInputContentUpdateEvent()
    constructor(messageType: string, userName: string = '')
    {
        super('RWWCIDE_CHAT_INPUT_CONTENT');

        this._messageType = messageType;
        this._userName = userName;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetChatInputContentUpdateEvent.as::get messageType()
    public get messageType(): string
    {
        return this._messageType;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetChatInputContentUpdateEvent.as::get userName()
    public get userName(): string
    {
        return this._userName;
    }
}
