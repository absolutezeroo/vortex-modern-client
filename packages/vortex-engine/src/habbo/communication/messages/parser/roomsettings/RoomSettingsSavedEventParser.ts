import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class RoomSettingsSavedEventParser implements IMessageParser
{
    private _roomId: number = 0;

    flush(): boolean
    {
        this._roomId = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._roomId = wrapper.readInt();
        return true;
    }

    get roomId(): number { return this._roomId; }
}
