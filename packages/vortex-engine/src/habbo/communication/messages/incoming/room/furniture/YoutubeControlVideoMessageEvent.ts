import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    YoutubeControlVideoMessageEventParser
} from '@habbo/communication/messages/parser/room/furniture/YoutubeControlVideoMessageEventParser';

/**
 * A server-driven playback command for a YouTube display — see
 * `YoutubeDisplayWidget.controlVideo()`.
 *
 * Header 2958, confirmed in WIN63's registry
 * (`_SafeCls_2046.as::_SafeStr_4546[2958] = _SafeCls_3290`) and corroborated by vortex-emulator's
 * `YoutubeControlVideoMessageComposer = 2958` (the emulator's naming is the mirror of this
 * client's — see `GetYoutubeDisplayStatusMessageComposer` for why).
 *
 * The real name is recovered from `sources/win63_version/habbo/communication/messages/incoming/
 * room/furniture/YoutubeControlVideoMessageEvent.as` — obfuscated as `_SafeCls_3290` in the
 * primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2437/_SafeCls_3290.as
 */
export class YoutubeControlVideoMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2437/_SafeCls_3290.as::_SafeCls_3290()
    constructor(callback: MessageEventCallback)
    {
        super(callback, YoutubeControlVideoMessageEventParser);
    }
}
