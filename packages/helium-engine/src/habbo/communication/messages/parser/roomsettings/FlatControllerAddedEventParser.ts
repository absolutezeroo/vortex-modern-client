import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {RoomSettingsController} from './RoomSettingsController';

export class FlatControllerAddedEventParser implements IMessageParser
{
    private _flatId: number = 0;
    private _data: RoomSettingsController | null = null;

    flush(): boolean
    {
        this._data = null;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._flatId = wrapper.readInt();
        this._data = new RoomSettingsController(wrapper);
        return true;
    }

    get flatId(): number { return this._flatId; }
    get data(): RoomSettingsController | null { return this._data; }
}
