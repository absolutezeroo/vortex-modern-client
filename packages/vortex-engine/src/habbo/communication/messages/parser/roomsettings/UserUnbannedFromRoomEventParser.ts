import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class UserUnbannedFromRoomEventParser implements IMessageParser
{
    private _roomId: number = 0;
    private _userId: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/UserUnbannedFromRoomEventParser.as::flush()
    flush(): boolean
    {
        this._roomId = 0;
        this._userId = 0;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/UserUnbannedFromRoomEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._roomId = wrapper.readInt();
        this._userId = wrapper.readInt();
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/UserUnbannedFromRoomEventParser.as::get roomId()
    get roomId(): number { return this._roomId; }
    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/UserUnbannedFromRoomEventParser.as::get userId()
    get userId(): number { return this._userId; }
}
