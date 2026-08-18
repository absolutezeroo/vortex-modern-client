import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RewardTracksMessageEventParser} from '../../parser/quest/RewardTracksMessageEventParser';

/**
 * Every reward track the user can see. Header 3794, from WIN63's own registry.
 *
 * **The name is DERIVED.** The reward track is new in the 2026 build — `win63_version` has no
 * message file for it, PRODUCTION predates it, and the emulator has no header for 3794 in either
 * direction. Named for its handler, `RewardTrackController.onRewardTracks()`, which is unobfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2744/_SafeCls_2743.as
 */
export class RewardTracksMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_2743.as::_SafeCls_2743()
    constructor(callback: MessageEventCallback)
    {
        super(callback, RewardTracksMessageEventParser);
    }

    /**
     * AS3 declares `getParser()`; the port's `MessageEvent` already has a generic method of that
     * name, so the typed accessor is exposed as a getter instead.
     */
    // AS3: _SafeCls_2743.as::getParser()
    get rewardTrackParser(): RewardTracksMessageEventParser
    {
        return this._parser as RewardTracksMessageEventParser;
    }
}
