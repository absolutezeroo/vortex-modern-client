import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    YoutubeDisplayPlaylistsMessageEventParser
} from '@habbo/communication/messages/parser/room/furniture/YoutubeDisplayPlaylistsMessageEventParser';

/**
 * Delivers the YouTube display's playlist list — see `YoutubeDisplayWidget.populatePlaylists()`.
 *
 * Header 807, confirmed in WIN63's registry (`_SafeCls_2046.as::_SafeStr_4546[807] = _SafeCls_3592`)
 * and corroborated by vortex-emulator's `YoutubeDisplayPlaylistsMessageComposer = 807` (the
 * emulator's naming is the mirror of this client's — see `GetYoutubeDisplayStatusMessageComposer`
 * for why).
 *
 * The real name is recovered from `sources/win63_version/habbo/communication/messages/incoming/
 * room/furniture/YoutubeDisplayPlaylistsMessageEvent.as` — obfuscated as `_SafeCls_3592` in the
 * primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2437/_SafeCls_3592.as
 */
export class YoutubeDisplayPlaylistsMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2437/_SafeCls_3592.as::_SafeCls_3592()
    constructor(callback: MessageEventCallback)
    {
        super(callback, YoutubeDisplayPlaylistsMessageEventParser);
    }
}
