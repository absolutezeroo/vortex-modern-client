import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    RentableSpaceRentOkMessageEventParser
} from '../../../parser/room/furniture/RentableSpaceRentOkMessageEventParser';

/**
 * The rent went through.
 *
 * Handled by AS3: `_SafeCls_3971.onRentableSpaceRentOkMessage()`, which ignores the payload and simply re-asks for
 * the status.
 *
 * Header 2158, from WIN63's registry (`_events[2158] = _SafeCls_2436`); the emulator corroborates it as
 * `RentableSpaceRentOkMessageComposer`. The class name is recovered from
 * `sources/win63_version/habbo/communication/messages/incoming/room/furniture/RentableSpaceRentOkMessageEvent.as`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2437/_SafeCls_2436.as
 */
export class RentableSpaceRentOkMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RentableSpaceRentOkMessageEventParser);
    }

    /**
     * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2437/_SafeCls_2436.as::getParser()
     *
     * Named `rentableSpaceRentOkParser` rather than overriding the base `getParser<T>()`, whose generic
     * signature a narrowed return type cannot satisfy.
     */
    get rentableSpaceRentOkParser(): RentableSpaceRentOkMessageEventParser | null
    {
        return this._parser as RentableSpaceRentOkMessageEventParser | null;
    }
}
