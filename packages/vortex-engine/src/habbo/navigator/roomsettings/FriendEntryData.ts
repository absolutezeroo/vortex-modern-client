/**
 * Simple data class holding a friend's user ID and name.
 * Used by RoomSettingsFriendListManager for room settings friend list display.
 *
 * @see source_as_win63/habbo/navigator/roomsettings/FriendEntryData.as
 */
export class FriendEntryData
{
    constructor(userId: number, userName: string)
    {
        this._userId = userId;
        this._userName = userName;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/roomsettings/FriendEntryData.as::_userId
    private _userId: number;

    // AS3: .../src/com/sulake/habbo/navigator/roomsettings/FriendEntryData.as::get userId()
    get userId(): number
    {
        return this._userId;
    }

    // AS3: .../src/com/sulake/habbo/navigator/roomsettings/FriendEntryData.as::_userName
    private _userName: string;

    // AS3: .../src/com/sulake/habbo/navigator/roomsettings/FriendEntryData.as::get userName()
    get userName(): string
    {
        return this._userName;
    }
}
