import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ShowMysteryBoxWaitMessageParser} from '../../parser/mysterybox/ShowMysteryBoxWaitMessageParser';

/**
 * Header 691 — open the mystery-box waiting dialog.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/mysterybox/ShowMysteryBoxWaitMessageEvent.as
 *
 * WIN63 primary: `src/unknowns/_SafePkg_2222/_SafeCls_3631.as`, registered at
 * `_SafeCls_2046.as::_events[691]`.
 */
export class ShowMysteryBoxWaitMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, ShowMysteryBoxWaitMessageParser);
    }
}
