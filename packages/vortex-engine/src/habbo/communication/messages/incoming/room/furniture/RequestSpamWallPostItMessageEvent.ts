import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    RequestSpamWallPostItMessageParser
} from '../../../parser/room/furniture/RequestSpamWallPostItMessageParser';

/**
 * RequestSpamWallPostItMessageEvent (header 2816)
 *
 * Opens the spam-wall post-it editor on a freshly placed note.
 *
 * Name recovered from the emulator's `RequestSpamWallPostItMessageComposer = 2816`; the AS3
 * class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2437/_SafeCls_3830.as
 */
export class RequestSpamWallPostItMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RequestSpamWallPostItMessageParser);
    }
}
