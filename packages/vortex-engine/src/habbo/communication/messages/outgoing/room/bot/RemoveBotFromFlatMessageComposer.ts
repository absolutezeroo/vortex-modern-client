import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Pick a rentable bot back up out of the room — the "OBJECT_PICKUP_BOT" gesture.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2136/_SafeCls_3108.as
 *
 * Header 2743, from WIN63's registry (`_SafeCls_2046.as::_composers[2743]`). Corroborated by
 * vortex-emulator's `RemoveBotFromFlatMessageEvent = 2743`.
 *
 * Takes the bot's `webID`, not its room-object id — `modifyRoomObject()` resolves the user data
 * first and sends `userData.webID`, mirroring the pet pickup path directly above it.
 *
 * The server will not act on this: vortex-emulator has no bot entity or AI at all, only the
 * protocol surface (docs/CLIENT-SERVER-ARCHITECTURE.md §18 "Bots — Do Not Exist"). The client
 * side is still the faithful port.
 *
 * The name comes from vortex-emulator; no unobfuscated tree carries this composer.
 */
export class RemoveBotFromFlatMessageComposer extends MessageComposer<[number]>
{
    private _data: [number];

    constructor(webId: number)
    {
        super();
        this._data = [webId];
    }

    getMessageArray(): [number]
    {
        return this._data;
    }
}
