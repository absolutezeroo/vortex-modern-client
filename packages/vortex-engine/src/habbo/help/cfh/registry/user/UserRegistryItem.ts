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

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/cfh/registry/user/UserRegistryItem.as::_userId
    private _userId: number;

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/user/UserRegistryItem.as::get userId()
    get userId(): number
    {
        return this._userId;
    }

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/user/UserRegistryItem.as::_userName
    private _userName: string;

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/user/UserRegistryItem.as::get userName()
    get userName(): string
    {
        return this._userName;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/cfh/registry/user/UserRegistryItem.as::_figure
    private _figure: string;

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/user/UserRegistryItem.as::get figure()
    get figure(): string
    {
        return this._figure;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/cfh/registry/user/UserRegistryItem.as::_roomId
    private _roomId: number;

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/user/UserRegistryItem.as::get roomId()
    get roomId(): number
    {
        return this._roomId;
    }

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/user/UserRegistryItem.as::_roomName
    private _roomName: string;

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/user/UserRegistryItem.as::get roomName()
    get roomName(): string
    {
        return this._roomName;
    }

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/user/UserRegistryItem.as::set roomName()
    set roomName(value: string)
    {
        this._roomName = value;
    }
}
