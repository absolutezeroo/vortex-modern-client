import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {RoomSettingsController} from './RoomSettingsController';

export class FlatControllersEventParser implements IMessageParser
{
    private _roomId: number = 0;
    private _controllers: RoomSettingsController[] = [];

    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/FlatControllersEventParser.as::flush()
    flush(): boolean
    {
        this._controllers = [];
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/FlatControllersEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._roomId = wrapper.readInt();
        this._controllers = [];
        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._controllers.push(new RoomSettingsController(wrapper));
        }

        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/FlatControllersEventParser.as::get roomId()
    get roomId(): number { return this._roomId; }
    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/FlatControllersEventParser.as::get controllers()
    get controllers(): RoomSettingsController[] { return this._controllers; }
}
