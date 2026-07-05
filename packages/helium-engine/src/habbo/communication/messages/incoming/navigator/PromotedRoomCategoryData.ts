import type {IMessageDataWrapper} from '@core/communication';
import {GuestRoomData} from './GuestRoomData';

/**
 * Promoted room category data
 *
 * Based on AS3 com.sulake.habbo.communication.messages.incoming.navigator.class_1784
 */
export class PromotedRoomCategoryData
{
    constructor(wrapper: IMessageDataWrapper)
    {
        this._code = wrapper.readString();
        this._leaderFigure = wrapper.readString();

        const count = wrapper.readInt();

        // First room is the best room
        this._bestRoom = new GuestRoomData(wrapper);

        // Remaining rooms
        for(let i = 1; i < count; i++)
        {
            this._rooms.push(new GuestRoomData(wrapper));
        }
    }

    private _code: string = '';

    get code(): string
    {
        return this._code;
    }

    private _leaderFigure: string = '';

    get leaderFigure(): string
    {
        return this._leaderFigure;
    }

    private _bestRoom: GuestRoomData;

    get bestRoom(): GuestRoomData
    {
        return this._bestRoom;
    }

    private _rooms: GuestRoomData[] = [];

    get rooms(): GuestRoomData[]
    {
        return this._rooms;
    }

    private _figurePending: boolean = false;

    get figurePending(): boolean
    {
        return this._figurePending;
    }

    set figurePending(value: boolean)
    {
        this._figurePending = value;
    }

    private _open: boolean = false;

    get open(): boolean
    {
        return this._open;
    }

    set open(value: boolean)
    {
        this._open = value;
    }

    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    toggleOpen(): void
    {
        this._open = !this._open;
    }

    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }
        this._disposed = true;

        if(this._bestRoom)
        {
            this._bestRoom.dispose();
        }

        for(const room of this._rooms)
        {
            room.dispose();
        }
        this._rooms = [];
    }
}
