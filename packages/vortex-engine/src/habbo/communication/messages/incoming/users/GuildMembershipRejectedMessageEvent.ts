import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    GuildMembershipRejectedMessageParser
} from '../../parser/users/GuildMembershipRejectedMessageParser';

/**
 * GuildMembershipRejectedMessageEvent (header 595)
 *
 * A membership request was turned down. Like AS3, the window reads the parser rather than
 * the event — nothing is exposed here beyond it.
 *
 * Name recovered from the emulator's `GuildMembershipRejectedMessageComposer = 595`; the
 * AS3 class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_1930.as
 */
export class GuildMembershipRejectedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GuildMembershipRejectedMessageParser);
    }

    /**
     * AS3 declares its own typed `getParser()`; `MessageEvent` here already provides a
     * generic one, so callers write `getParser<GuildMembershipRejectedMessageParser>()` rather than
     * having the type baked in. Overriding it would clash with the base signature.
     */
    // AS3: .../_SafeCls_1930.as::getParser()
}
