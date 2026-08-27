import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks the server for the YouTube display's current status — sent the moment `RWE_YOUTUBE`'s
 * `RETWE_OPEN_WIDGET` fires, right after `YoutubeDisplayWidget.show()`.
 *
 * Header 273, confirmed in WIN63's registry (`_SafeCls_2046.as::_composers[273] = _SafeCls_2883`)
 * and corroborated by vortex-emulator's `GetYoutubeDisplayStatusMessageEvent = 273` (the emulator
 * names client→server messages "...MessageEvent" and server→client ones "...MessageComposer" — the
 * opposite of this client's own Composer/Event split — so its name is the mirror of this class's,
 * not a second confirmation of the direction).
 *
 * The real name is recovered from `sources/win63_version/habbo/communication/messages/outgoing/
 * room/furniture/GetYoutubeDisplayStatusMessageComposer.as` — obfuscated as `_SafeCls_2883` in the
 * primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_2883.as
 */
export class GetYoutubeDisplayStatusMessageComposer extends MessageComposer<[number]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_2883.as::_SafeStr_4642
    private _data: [number];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_2883.as::_SafeCls_2883()
    constructor(furniId: number)
    {
        super();

        this._data = [furniId];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_2883.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
