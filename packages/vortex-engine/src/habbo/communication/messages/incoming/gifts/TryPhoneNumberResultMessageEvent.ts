import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    TryPhoneNumberResultMessageEventParser
} from '../../parser/gifts/TryPhoneNumberResultMessageEventParser';

/**
 * The server's verdict on a submitted phone number.
 *
 * Handled by AS3: `HabboPhoneNumber.onPhoneNumberResultMessage()`.
 *
 * Header 2845, from WIN63's registry (`_events[2845] = _SafeCls_3659`); the emulator corroborates
 * it as `TryPhoneNumberResultMessageComposer`. The class name is recovered from
 * `sources/win63_version/habbo/communication/messages/incoming/gifts/TryPhoneNumberResultMessageEvent.as`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3660/_SafeCls_3659.as
 */
export class TryPhoneNumberResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, TryPhoneNumberResultMessageEventParser);
    }

    /**
     * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3660/_SafeCls_3659.as::getParser()
     *
     * Named `tryPhoneNumberResultParser` rather than overriding the base `getParser<T>()`, whose
     * generic signature a narrowed return type cannot satisfy.
     */
    get tryPhoneNumberResultParser(): TryPhoneNumberResultMessageEventParser | null
    {
        return this._parser as TryPhoneNumberResultMessageEventParser | null;
    }
}
