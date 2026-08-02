import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * The server's answer to picking a starter room.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3895/_SafeCls_4315.as
 *
 * Read order is short then integer — status, then the id of the room that was created.
 */
export class SelectInitialRoomMessageParser implements IMessageParser
{
    private _status: number = 0;
    private _roomId: number = 0;

    // AS3: flush()
    flush(): boolean
    {
        this._status = 0;
        this._roomId = 0;

        return true;
    }

    // AS3: parse(_arg_1:IMessageDataWrapper)
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._status = wrapper.readShort();
        this._roomId = wrapper.readInt();

        return true;
    }

    // AS3: get status():int
    get status(): number
    {
        return this._status;
    }

    // AS3: get roomId():int
    get roomId(): number
    {
        return this._roomId;
    }
}
