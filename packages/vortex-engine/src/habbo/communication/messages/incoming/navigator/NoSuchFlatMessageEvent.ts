import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NoSuchFlatMessageEventParser} from '../../parser/navigator/NoSuchFlatMessageEventParser';

/**
 * NoSuchFlatMessageEvent (header 1122)
 *
 * The requested room does not exist. AS3's navigator registers this and its handler
 * body is empty, so the id is parsed and nothing is done with it.
 *
 * Name recovered from the emulator's `NoSuchFlatComposer = 1122`; the AS3 class is
 * obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1710/_SafeCls_3268.as
 */
export class NoSuchFlatMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, NoSuchFlatMessageEventParser);
    }
}
