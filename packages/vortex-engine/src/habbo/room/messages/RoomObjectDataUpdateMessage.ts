/**
 * RoomObjectDataUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectDataUpdateMessage
 *
 * Update message for furniture state and data.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';
import type {IStuffData} from '../object/data/IStuffData';

export class RoomObjectDataUpdateMessage extends RoomObjectUpdateMessage
{
    constructor(state: number, data: IStuffData | null, extra: number = NaN)
    {
        super(null, null);
        this._state = state;
        this._data = data;
        this._extra = extra;
    }

    private _state: number;

    get state(): number
    {
        return this._state;
    }

    private _data: IStuffData | null;

    get data(): IStuffData | null
    {
        return this._data;
    }

    private _extra: number;

    get extra(): number
    {
        return this._extra;
    }
}
