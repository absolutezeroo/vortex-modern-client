import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class UserUnbannedFromRoomEventParser implements IMessageParser
{
    private _roomId: number = 0;
    private _userId: number = 0;

    flush(): boolean
    {
        this._roomId = 0;
        this._userId = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._roomId = wrapper.readInt();
        this._userId = wrapper.readInt();
        return true;
    }

    get roomId(): number { return this._roomId; }
    get userId(): number { return this._userId; }
}
