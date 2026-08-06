import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    PhoneCollectionStateMessageEventParser
} from '../../parser/gifts/PhoneCollectionStateMessageEventParser';

/**
 * Where the player stands in the SMS identity-verification flow.
 *
 * Handled by AS3: `HabboPhoneNumber.onStateMessage()`, which is the entry point of the whole
 * feature — it decides whether to ask for a number, ask for the code, or do nothing.
 *
 * Header 2833, from WIN63's registry (`_events[2833] = _SafeCls_3686`). The emulator has no
 * constant for it, so there is no corroboration; the class name is recovered from
 * `sources/win63_version/habbo/communication/messages/incoming/gifts/PhoneCollectionStateMessageEvent.as`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3660/_SafeCls_3686.as
 */
export class PhoneCollectionStateMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, PhoneCollectionStateMessageEventParser);
    }

    /**
     * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3660/_SafeCls_3686.as::getParser()
     *
     * Named `phoneCollectionStateParser` rather than overriding the base `getParser<T>()`, whose
     * generic signature a narrowed return type cannot satisfy.
     */
    get phoneCollectionStateParser(): PhoneCollectionStateMessageEventParser | null
    {
        return this._parser as PhoneCollectionStateMessageEventParser | null;
    }
}
