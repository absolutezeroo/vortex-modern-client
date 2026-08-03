import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    GetCustomFilterResultMessageEventParser
} from '../../parser/preferences/GetCustomFilterResultMessageEventParser';

/**
 * GetCustomFilterResultMessageEvent (header 2231)
 *
 * The player's whole word-filter list, answering `GetCustomFilter`.
 *
 * Header read from WIN63's own registry (habbo/communication/_SafeCls_2046.as,
 * `_SafeStr_4546[2231]`). The emulator's `Headers.cs` names a different number and
 * implements nothing for it — see the note in `WordFilterSettingsView`.
 *
 * Name DERIVED from its parser, which the dump leaves unobfuscated; the event class
 * itself is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3580/_SafeCls_3579.as
 */
export class GetCustomFilterResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GetCustomFilterResultMessageEventParser);
    }

    /**
     * AS3 declares its own typed `getParser()`; `MessageEvent` here already provides a
     * generic one, so callers write `getParser<GetCustomFilterResultMessageEventParser>()`.
     * Overriding it would clash with the base signature.
     */
    // AS3: .../_SafeCls_3579.as::getParser()
}
