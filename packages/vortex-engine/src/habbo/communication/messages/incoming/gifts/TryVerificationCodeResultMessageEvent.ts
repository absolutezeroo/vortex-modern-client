import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    TryVerificationCodeResultMessageEventParser
} from '../../parser/gifts/TryVerificationCodeResultMessageEventParser';

/**
 * The server's verdict on a submitted verification code.
 *
 * Handled by AS3: `HabboPhoneNumber.onVerificationCodeResultMessage()`.
 *
 * Header 712, from WIN63's registry (`_events[712] = _SafeCls_3680`); the emulator corroborates it
 * as `TryVerificationCodeResultMessageComposer`. The class name is recovered from
 * `sources/win63_version/habbo/communication/messages/incoming/gifts/TryVerificationCodeResultMessageEvent.as`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3660/_SafeCls_3680.as
 */
export class TryVerificationCodeResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, TryVerificationCodeResultMessageEventParser);
    }

    /**
     * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3660/_SafeCls_3680.as::getParser()
     *
     * Named `tryVerificationCodeResultParser` rather than overriding the base `getParser<T>()`,
     * whose generic signature a narrowed return type cannot satisfy.
     */
    get tryVerificationCodeResultParser(): TryVerificationCodeResultMessageEventParser | null
    {
        return this._parser as TryVerificationCodeResultMessageEventParser | null;
    }
}
