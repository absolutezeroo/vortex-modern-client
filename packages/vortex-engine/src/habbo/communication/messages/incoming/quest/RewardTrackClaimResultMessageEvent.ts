import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RewardTrackClaimResultMessageEventParser} from '../../parser/quest/RewardTrackClaimResultMessageEventParser';

/**
 * The answer to claiming a prize. Header 522, from WIN63's own registry.
 *
 * **The name is DERIVED.** The reward track is new in the 2026 build — `win63_version` has no
 * message file for it, PRODUCTION predates it, and the emulator has no header for 522 in either
 * direction. Named for its handler, `RewardTrackController.onRewardTrackClaimResult()`, which is unobfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2744/_SafeCls_3381.as
 */
export class RewardTrackClaimResultMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_3381.as::_SafeCls_3381()
    constructor(callback: MessageEventCallback)
    {
        super(callback, RewardTrackClaimResultMessageEventParser);
    }

    /**
     * AS3 declares `getParser()`; the port's `MessageEvent` already has a generic method of that
     * name, so the typed accessor is exposed as a getter instead.
     */
    // AS3: _SafeCls_3381.as::getParser()
    get rewardTrackParser(): RewardTrackClaimResultMessageEventParser
    {
        return this._parser as RewardTrackClaimResultMessageEventParser;
    }
}
