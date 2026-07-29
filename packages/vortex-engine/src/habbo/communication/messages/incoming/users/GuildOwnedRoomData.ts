/**
 * GuildOwnedRoomData
 *
 * One entry of the "base room" drop-menu offered when creating or editing a guild.
 *
 * The AS3 class is obfuscated in every available tree (`_SafeCls_3030` in WIN63) and it
 * did not exist in the 2016 PRODUCTION build, so the class name here is DERIVED from its
 * three members; only `roomId` / `roomName` / `hasControllers` are recovered.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_3030.as
 */
export class GuildOwnedRoomData
{
    private _roomId: number;
    private _roomName: string;
    private _hasControllers: boolean;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_3030.as::_SafeCls_3030()
    constructor(roomId: number, roomName: string, hasControllers: boolean)
    {
        this._roomId = roomId;
        this._roomName = roomName;
        this._hasControllers = hasControllers;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_3030.as::get roomId()
    get roomId(): number
    {
        return this._roomId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_3030.as::get roomName()
    get roomName(): string
    {
        return this._roomName;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_3030.as::get hasControllers()
    get hasControllers(): boolean
    {
        return this._hasControllers;
    }
}
