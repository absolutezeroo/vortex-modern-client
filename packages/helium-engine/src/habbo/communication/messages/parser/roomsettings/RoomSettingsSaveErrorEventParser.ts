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

    flush(): boolean
    {
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._roomId = wrapper.readInt();
        this._errorCode = wrapper.readInt();
        this._info = wrapper.readString();
        return true;
    }

    get roomId(): number { return this._roomId; }
    get errorCode(): number { return this._errorCode; }
    get info(): string { return this._info; }
}
