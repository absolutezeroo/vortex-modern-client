/**
 * User data model for CFH reports
 *
 * Stores user information including their room context for use
 * in the Call For Help reporting flow.
 *
 * @see source_as_win63/habbo/help/cfh/registry/user/UserRegistryItem.as
 */
export class UserRegistryItem
{
    constructor(userId: number, userName: string, figure: string, roomId: number, roomName: string = '')
    {
        this._userId = userId;
        this._userName = userName;
        this._figure = figure;
        this._roomId = roomId;
        this._roomName = roomName;
    }

    private _userId: number;

    get userId(): number
    {
        return this._userId;
    }

    private _userName: string;

    get userName(): string
    {
        return this._userName;
    }

    private _figure: string;

    get figure(): string
    {
        return this._figure;
    }

    private _roomId: number;

    get roomId(): number
    {
        return this._roomId;
    }

    private _roomName: string;

    get roomName(): string
    {
        return this._roomName;
    }

    set roomName(value: string)
    {
        this._roomName = value;
    }
}
