import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    RentableSpaceStatusMessageEventParser
} from '../../../parser/room/furniture/RentableSpaceStatusMessageEventParser';

/**
 * The state of a rentable space, in answer to `RentableSpaceStatusMessageComposer`.
 *
 * Handled by AS3: `_SafeCls_3971.onRentableSpaceStatusMessage()`, which pushes all seven fields into the widget's
 * `populateRentInfo()`.
 *
 * Header 2800, from WIN63's registry (`_events[2800] = _SafeCls_2800`); the emulator corroborates it as
 * `RentableSpaceStatusMessageComposer`. The class name is recovered from
 * `sources/win63_version/habbo/communication/messages/incoming/room/furniture/RentableSpaceStatusMessageEvent.as`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2437/_SafeCls_2800.as
 */
export class RentableSpaceStatusMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RentableSpaceStatusMessageEventParser);
    }

    /**
     * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2437/_SafeCls_2800.as::getParser()
     *
     * Named `rentableSpaceStatusParser` rather than overriding the base `getParser<T>()`, whose generic
     * signature a narrowed return type cannot satisfy.
     */
    get rentableSpaceStatusParser(): RentableSpaceStatusMessageEventParser | null
    {
        return this._parser as RentableSpaceStatusMessageEventParser | null;
    }
}
