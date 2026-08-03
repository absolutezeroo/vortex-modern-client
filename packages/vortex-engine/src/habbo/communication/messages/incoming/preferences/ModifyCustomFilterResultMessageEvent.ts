import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    ModifyCustomFilterResultMessageEventParser
} from '../../parser/preferences/ModifyCustomFilterResultMessageEventParser';

/**
 * ModifyCustomFilterResultMessageEvent (header 3622)
 *
 * The outcome of an add or a remove. The word-filter window applies nothing locally, so
 * this is what actually moves a word on or off the list.
 *
 * Header read from WIN63's own registry (habbo/communication/_SafeCls_2046.as,
 * `_SafeStr_4546[3622]`). The emulator's `Headers.cs` names a different number and
 * implements nothing for it — see the note in `WordFilterSettingsView`.
 *
 * Name DERIVED from its parser, which the dump leaves unobfuscated; the event class
 * itself is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3580/_SafeCls_3793.as
 */
export class ModifyCustomFilterResultMessageEvent extends MessageEvent implements IMessageEvent
{
    /**
     * AS3 declares three result constants, all obfuscated, and tests only two of them —
     * `1` on the add path and `3` on the remove path. Those two names are DERIVED from
     * that use. `0` is tested nowhere in the client, so its meaning is not recoverable
     * from this tree; it is declared with its value and no claim about what it means.
     */
    // AS3: .../_SafeCls_3793.as::_SafeStr_10918
    public static readonly RESULT_UNKNOWN_ZERO: number = 0;

    // AS3: .../_SafeCls_3793.as::_SafeStr_10832
    public static readonly RESULT_ADDED: number = 1;

    // AS3: .../_SafeCls_3793.as::_SafeStr_11025
    public static readonly RESULT_REMOVED: number = 3;

    constructor(callback: MessageEventCallback)
    {
        super(callback, ModifyCustomFilterResultMessageEventParser);
    }

    /**
     * AS3 declares its own typed `getParser()`; `MessageEvent` here already provides a
     * generic one, so callers write `getParser<ModifyCustomFilterResultMessageEventParser>()`.
     * Overriding it would clash with the base signature.
     */
    // AS3: .../_SafeCls_3793.as::getParser()
}
