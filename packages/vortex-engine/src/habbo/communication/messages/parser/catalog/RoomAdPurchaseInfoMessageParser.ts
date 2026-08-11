import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

import {GuildOwnedRoomData} from '../../incoming/users/GuildOwnedRoomData';

/**
 * The rooms a room ad can point at, and whether the player has club (header 3787).
 *
 * The room entries are the same AS3 class the guild "base room" drop-menu uses
 * (`_SafePkg_1731._SafeCls_3030`), already ported as `GuildOwnedRoomData` — reused here rather
 * than duplicated, because two TS classes for one AS3 class is how objects end up failing an
 * `instanceof` for no visible reason.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_4049.as
 * (obfuscated; identified as this parser by `_SafeCls_2920`, the event registered as
 * `_SafeStr_4546[3787]` in
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as, whose
 * `getParser()` returns it. `vortex-emulator` corroborates the header and the field order:
 * `Revision20260701/Serializers/Catalog/RoomAdPurchaseInfoEventMessageComposerSerializer.cs`.)
 */
export class RoomAdPurchaseInfoMessageParser implements IMessageParser
{
    /**
     * Field name DERIVED from its accessor `isVip`, which is not obfuscated.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_4049.as::_SafeStr_8483
    private _isVip: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_4049.as::_rooms
    private _rooms: GuildOwnedRoomData[] = [];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_4049.as::get rooms()
    get rooms(): GuildOwnedRoomData[]
    {
        return this._rooms;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_4049.as::get isVip()
    get isVip(): boolean
    {
        return this._isVip;
    }

    /**
     * AS3 returns `false` here, which for this base means "keep the parsed state" — the widget
     * reads `rooms` straight off the parser inside its own handler, so flushing would empty it
     * before the read.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_4049.as::flush()
    flush(): boolean
    {
        return false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_4049.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._rooms = [];
        this._isVip = wrapper.readBoolean();

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const roomId = wrapper.readInt();
            const roomName = wrapper.readString();
            const hasControllers = wrapper.readBoolean();

            this._rooms.push(new GuildOwnedRoomData(roomId, roomName, hasControllers));
        }

        return true;
    }
}
