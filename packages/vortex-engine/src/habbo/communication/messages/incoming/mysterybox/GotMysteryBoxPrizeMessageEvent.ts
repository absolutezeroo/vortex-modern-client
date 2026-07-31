import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GotMysteryBoxPrizeMessageParser} from '../../parser/mysterybox/GotMysteryBoxPrizeMessageParser';

/**
 * Header 353 — the box paid out; swap the waiting dialog for the reward dialog.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/mysterybox/GotMysteryBoxPrizeMessageEvent.as
 *
 * WIN63 primary: `src/unknowns/_SafePkg_2222/_SafeCls_3978.as`, registered at
 * `_SafeCls_2046.as::_events[353]`.
 */
export class GotMysteryBoxPrizeMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GotMysteryBoxPrizeMessageParser);
    }
}
