import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class RoomSettingsSaveErrorEventParser implements IMessageParser
{
    static readonly ERROR_INVALID_NAME: number = 1;
    static readonly ERROR_INVALID_DESCRIPTION: number = 2;
    static readonly ERROR_INVALID_PASSWORD: number = 3;
    static readonly ERROR_INVALID_ROOM_DOOR_MODE: number = 4;
    static readonly ERROR_INVALID_TAG: number = 5;
    static readonly ERROR_TOO_MANY_TAGS: number = 6;
    static readonly ERROR_ROOM_NAME_TAKEN: number = 7;
    static readonly ERROR_INVALID_CATEGORY: number = 8;
    static readonly ERROR_INVALID_MAXIMUM_VISITORS: number = 9;
    static readonly ERROR_INVALID_TRADE_SETTING: number = 10;
    static readonly ERROR_INVALID_ALLOWED_PETS: number = 11;
    static readonly ERROR_INVALID_WALK_THROUGH: number = 12;
    static readonly ERROR_INVALID_THICKNESS: number = 13;

    private _roomId: number = 0;
    private _errorCode: number = 0;
    private _info: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/RoomSettingsSaveErrorEventParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/RoomSettingsSaveErrorEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._roomId = wrapper.readInt();
        this._errorCode = wrapper.readInt();
        this._info = wrapper.readString();
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/RoomSettingsSaveErrorEventParser.as::get roomId()
    get roomId(): number { return this._roomId; }
    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/RoomSettingsSaveErrorEventParser.as::get errorCode()
    get errorCode(): number { return this._errorCode; }
    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/RoomSettingsSaveErrorEventParser.as::get info()
    get info(): string { return this._info; }
}
