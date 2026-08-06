import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {RoomSettingsController} from './RoomSettingsController';

export class FlatControllerAddedEventParser implements IMessageParser
{
    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/FlatControllerAddedEventParser.as::_flatId
    private _flatId: number = 0;
    private _data: RoomSettingsController | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/FlatControllerAddedEventParser.as::flush()
    flush(): boolean
    {
        this._data = null;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/FlatControllerAddedEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._flatId = wrapper.readInt();
        this._data = new RoomSettingsController(wrapper);
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/FlatControllerAddedEventParser.as::get flatId()
    get flatId(): number { return this._flatId; }
    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/FlatControllerAddedEventParser.as::get data()
    get data(): RoomSettingsController | null { return this._data; }
}
