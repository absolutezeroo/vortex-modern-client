import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GameStartedMessageEventParser} from '../../parser/navigator/GameStartedMessageEventParser';

/**
 * GameStartedMessageEvent (header 2902)
 *
 * A game lobby started. The navigator only closes its main view on this - it never
 * reads the payload.
 *
 * Name recovered from the emulator's `Game2GameStartedMessageComposer = 2902`; the AS3
 * class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2421/_SafeCls_3582.as
 */
export class GameStartedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GameStartedMessageEventParser);
    }
}
