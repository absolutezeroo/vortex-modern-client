import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Move/rotate a rentable bot already standing in the room.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2136/_SafeCls_2801.as
 *
 * Header **1295**, from WIN63's registry (`_SafeCls_2046.as::_composers[1295]`). Sent by
 * `habbo/room/_SafeCls_1821.as::sendMoveUserObjectMessage()` on the `rentable_bot` branch, the
 * sibling of the `monsterplant` one that sends {@link MovePetMessageComposer} (432). Body is
 * `(botRoomIndex, x, y, direction)`, all ints — same shape as the pet composer, but note the
 * first field: AS3 passes the raw room-object index here, where the pet branch passes the pet's
 * `webID` resolved through `userDataManager`.
 *
 * **The Turbo server does not implement it.** It has no bot entity at all
 * (`docs/CLIENT-SERVER-ARCHITECTURE.md` §"Bots — Do Not Exist"), so this send is answered by
 * nothing. It is ported anyway because `sendMoveUserObjectMessage()` cannot be a faithful port
 * with one of its two branches missing — the same reasoning already applied to
 * {@link RemoveBotFromFlatMessageComposer} on the pickup path.
 *
 * The name is derived from the message's role: no unobfuscated tree carries this composer
 * (`_SafeCls_2801` in the primary dump, absent from the 2016 PRODUCTION build), and unlike
 * `MovePetMessageComposer` there is no `win63_version` file name to recover it from.
 */
export class MoveBotMessageComposer extends MessageComposer<[number, number, number, number]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2136/_SafeCls_2801.as::_SafeStr_4556
    private _data: [number, number, number, number];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2136/_SafeCls_2801.as::_SafeCls_2801()
    constructor(botRoomIndex: number, x: number, y: number, direction: number)
    {
        super();
        this._data = [botRoomIndex, x, y, direction];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2136/_SafeCls_2801.as::getMessageArray()
    getMessageArray(): [number, number, number, number]
    {
        return this._data;
    }
}
