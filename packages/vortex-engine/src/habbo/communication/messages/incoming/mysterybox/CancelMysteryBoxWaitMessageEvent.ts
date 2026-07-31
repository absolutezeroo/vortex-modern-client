import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CancelMysteryBoxWaitMessageParser} from '../../parser/mysterybox/CancelMysteryBoxWaitMessageParser';

/**
 * Header 3840 — the other participant called the mystery-box flow off; close the dialog.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/mysterybox/CancelMysteryBoxWaitMessageEvent.as
 *
 * WIN63 primary: `src/unknowns/_SafePkg_2222/_SafeCls_3997.as`, registered at
 * `_SafeCls_2046.as::_events[3840]`.
 */
export class CancelMysteryBoxWaitMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CancelMysteryBoxWaitMessageParser);
    }
}
