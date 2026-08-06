import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class RoomSettingsSavedEventParser implements IMessageParser
{
    private _roomId: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/RoomSettingsSavedEventParser.as::flush()
    flush(): boolean
    {
        this._roomId = 0;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/RoomSettingsSavedEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._roomId = wrapper.readInt();
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/RoomSettingsSavedEventParser.as::get roomId()
    get roomId(): number { return this._roomId; }
}
