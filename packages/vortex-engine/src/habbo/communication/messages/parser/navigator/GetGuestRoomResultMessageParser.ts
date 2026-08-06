import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {GuestRoomData, RoomChatSettings, RoomModerationSettings} from '../../incoming/navigator';

/**
 * Parser for get guest room result message
 *
 * @see source_as_win63/habbo/communication/messages/parser/navigator/GetGuestRoomResultEventParser.as
 */
export class GetGuestRoomResultMessageParser implements IMessageParser
{
    private _enterRoom: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/GetGuestRoomResultEventParser.as::get enterRoom()
    get enterRoom(): boolean
    {
        return this._enterRoom;
    }

    private _roomForward: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/GetGuestRoomResultEventParser.as::get roomForward()
    get roomForward(): boolean
    {
        return this._roomForward;
    }

    private _staffPick: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/GetGuestRoomResultEventParser.as::get staffPick()
    get staffPick(): boolean
    {
        return this._staffPick;
    }

    private _isGroupMember: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/GetGuestRoomResultEventParser.as::get isGroupMember()
    get isGroupMember(): boolean
    {
        return this._isGroupMember;
    }

    private _openingConnection: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/GetGuestRoomResultEventParser.as::get openingConnection()
    get openingConnection(): boolean
    {
        return this._openingConnection;
    }

    private _data: GuestRoomData | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/GetGuestRoomResultEventParser.as::get data()
    get data(): GuestRoomData | null
    {
        return this._data;
    }

    private _roomModerationSettings: RoomModerationSettings | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/GetGuestRoomResultEventParser.as::get roomModerationSettings()
    get roomModerationSettings(): RoomModerationSettings | null
    {
        return this._roomModerationSettings;
    }

    private _chatSettings: RoomChatSettings | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/GetGuestRoomResultEventParser.as::get chatSettings()
    get chatSettings(): RoomChatSettings | null
    {
        return this._chatSettings;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/GetGuestRoomResultEventParser.as::flush()
    flush(): boolean
    {
        this._enterRoom = false;
        this._roomForward = false;
        this._staffPick = false;
        this._isGroupMember = false;
        this._openingConnection = false;
        this._data = null;
        this._roomModerationSettings = null;
        this._chatSettings = null;

        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/GetGuestRoomResultEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._enterRoom = wrapper.readBoolean();

        this._data = new GuestRoomData(wrapper);

        this._roomForward = wrapper.readBoolean();
        this._staffPick = wrapper.readBoolean();
        this._isGroupMember = wrapper.readBoolean();

        const allInRoomMuted = wrapper.readBoolean();

        this._roomModerationSettings = new RoomModerationSettings(wrapper);

        this._data.allInRoomMuted = allInRoomMuted;
        this._data.canMute = wrapper.readBoolean();

        this._chatSettings = new RoomChatSettings(wrapper);

        this._openingConnection = wrapper.readBoolean();

        return true;
    }
}
