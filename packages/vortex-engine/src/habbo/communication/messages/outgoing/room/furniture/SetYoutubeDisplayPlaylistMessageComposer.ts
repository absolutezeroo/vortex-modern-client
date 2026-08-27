import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Selects (or clears, with an empty string) the active playlist on a YouTube display — sent by
 * `YoutubeDisplayWidgetHandler.selectPlaylist()` when a playlist row is clicked.
 *
 * Header 1672, confirmed in WIN63's registry (`_SafeCls_2046.as::_composers[1672] = _SafeCls_3011`)
 * and corroborated by vortex-emulator's `SetYoutubeDisplayPlaylistMessageEvent = 1672` (the
 * emulator's naming is the mirror of this client's — see `GetYoutubeDisplayStatusMessageComposer`
 * for why).
 *
 * The real name is recovered from `sources/win63_version/habbo/communication/messages/outgoing/
 * room/furniture/SetYoutubeDisplayPlaylistMessageComposer.as` — obfuscated as `_SafeCls_3011` in
 * the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_3011.as
 */
export class SetYoutubeDisplayPlaylistMessageComposer extends MessageComposer<[number, string]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_3011.as::_SafeStr_4642
    private _data: [number, string];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_3011.as::_SafeCls_3011()
    constructor(furniId: number, playlistId: string)
    {
        super();

        this._data = [furniId, playlistId];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_3011.as::getMessageArray()
    getMessageArray(): [number, string]
    {
        return this._data;
    }
}
