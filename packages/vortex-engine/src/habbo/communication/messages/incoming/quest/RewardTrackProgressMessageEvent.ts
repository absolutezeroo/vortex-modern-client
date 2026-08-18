import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RewardTrackProgressMessageEventParser} from '../../parser/quest/RewardTrackProgressMessageEventParser';

/**
 * One task moved on. Header 2017, from WIN63's own registry.
 *
 * **The name is DERIVED.** The reward track is new in the 2026 build — `win63_version` has no
 * message file for it, PRODUCTION predates it, and the emulator has no header for 2017 in either
 * direction. Named for its handler, `RewardTrackController.onRewardTrackProgress()`, which is unobfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2744/_SafeCls_3829.as
 */
export class RewardTrackProgressMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_3829.as::_SafeCls_3829()
    constructor(callback: MessageEventCallback)
    {
        super(callback, RewardTrackProgressMessageEventParser);
    }

    /**
     * AS3 declares `getParser()`; the port's `MessageEvent` already has a generic method of that
     * name, so the typed accessor is exposed as a getter instead.
     */
    // AS3: _SafeCls_3829.as::getParser()
    get rewardTrackParser(): RewardTrackProgressMessageEventParser
    {
        return this._parser as RewardTrackProgressMessageEventParser;
    }
}
