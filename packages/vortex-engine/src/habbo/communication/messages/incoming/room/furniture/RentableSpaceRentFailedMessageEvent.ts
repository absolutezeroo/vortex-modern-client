import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    RentableSpaceRentFailedMessageEventParser
} from '../../../parser/room/furniture/RentableSpaceRentFailedMessageEventParser';

/**
 * The rent was refused, with a reason code.
 *
 * Handled by AS3: `_SafeCls_3971.onRentableSpaceRentFailedMessage()`, which shows the widget's error view.
 *
 * Header 3117, from WIN63's registry (`_events[3117] = _SafeCls_3147`); the emulator corroborates it as
 * `RentableSpaceRentFailedMessageComposer`. The class name is recovered from
 * `sources/win63_version/habbo/communication/messages/incoming/room/furniture/RentableSpaceRentFailedMessageEvent.as`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2437/_SafeCls_3147.as
 */
export class RentableSpaceRentFailedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RentableSpaceRentFailedMessageEventParser);
    }

    /**
     * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2437/_SafeCls_3147.as::getParser()
     *
     * Named `rentableSpaceRentFailedParser` rather than overriding the base `getParser<T>()`, whose generic
     * signature a narrowed return type cannot satisfy.
     */
    get rentableSpaceRentFailedParser(): RentableSpaceRentFailedMessageEventParser | null
    {
        return this._parser as RentableSpaceRentFailedMessageEventParser | null;
    }
}
