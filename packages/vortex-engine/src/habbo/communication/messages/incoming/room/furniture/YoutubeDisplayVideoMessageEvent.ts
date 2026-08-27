import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    YoutubeDisplayVideoMessageEventParser
} from '@habbo/communication/messages/parser/room/furniture/YoutubeDisplayVideoMessageEventParser';

/**
 * Tells the YouTube display which video to show (and where to resume it) — see
 * `YoutubeDisplayWidget.showVideo()`.
 *
 * Header 1227, confirmed in WIN63's registry (`_SafeCls_2046.as::_SafeStr_4546[1227] = _SafeCls_3847`)
 * and corroborated by vortex-emulator's `YoutubeDisplayVideoMessageComposer = 1227` (the emulator's
 * naming is the mirror of this client's — see `GetYoutubeDisplayStatusMessageComposer` for why).
 *
 * The real name is recovered from `sources/win63_version/habbo/communication/messages/incoming/
 * room/furniture/YoutubeDisplayVideoMessageEvent.as` — obfuscated as `_SafeCls_3847` in the primary
 * tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2437/_SafeCls_3847.as
 */
export class YoutubeDisplayVideoMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2437/_SafeCls_3847.as::_SafeCls_3847()
    constructor(callback: MessageEventCallback)
    {
        super(callback, YoutubeDisplayVideoMessageEventParser);
    }
}
