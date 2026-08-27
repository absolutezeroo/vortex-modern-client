import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Drives YouTube display playback: previous/next/pause/continue, keyed by `commandId`
 * (0 = previous video, 1 = next video, 2 = pause, 3 = continue — see
 * `YoutubeDisplayWidgetHandler`'s `CONTROL_COMMAND_*` constants).
 *
 * Header 1727, confirmed in WIN63's registry
 * (`_SafeCls_2046.as::_composers[1727] = _SafeCls_3497`) and corroborated by vortex-emulator's
 * `ControlYoutubeDisplayPlaybackMessageEvent = 1727` (the emulator's naming is the mirror of this
 * client's — see `GetYoutubeDisplayStatusMessageComposer` for why).
 *
 * The real name is recovered from `sources/win63_version/habbo/communication/messages/outgoing/
 * room/furniture/ControlYoutubeDisplayPlaybackMessageComposer.as` — obfuscated as `_SafeCls_3497`
 * in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_3497.as
 */
export class ControlYoutubeDisplayPlaybackMessageComposer extends MessageComposer<[number, number]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_3497.as::_SafeStr_4642
    private _data: [number, number];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_3497.as::_SafeCls_3497()
    constructor(furniId: number, commandId: number)
    {
        super();

        this._data = [furniId, commandId];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_3497.as::getMessageArray()
    getMessageArray(): [number, number]
    {
        return this._data;
    }
}
