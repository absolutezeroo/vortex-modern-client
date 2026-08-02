import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {SelectInitialRoomMessageParser} from '../../parser/nux/SelectInitialRoomMessageParser';

/**
 * The server's answer to `SelectInitialRoomMessageComposer`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_3056.as
 * Handled by AS3: `RoomPicker.onSelectInitialRoomResponse()` — a positive room id is set as the
 * home room, and the onboarding flow ends either way.
 *
 * Header 3624, from WIN63's registry (`_events[3624] = _SafeCls_3056`); the emulator corroborates
 * it as `SelectInitialRoomComposer`.
 */
export class SelectInitialRoomMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, SelectInitialRoomMessageParser);
    }

    /**
     * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_3056.as::getParser()
     *
     * Named `selectInitialRoomParser` rather than overriding the base `getParser<T>()`, whose
     * generic signature a narrowed return type cannot satisfy.
     */
    get selectInitialRoomParser(): SelectInitialRoomMessageParser | null
    {
        return this._parser as SelectInitialRoomMessageParser | null;
    }
}
