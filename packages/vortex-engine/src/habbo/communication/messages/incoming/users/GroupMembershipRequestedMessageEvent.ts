import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    GroupMembershipRequestedMessageParser
} from '../../parser/users/GroupMembershipRequestedMessageParser';

/**
 * GroupMembershipRequestedMessageEvent (header 2087)
 *
 * Somebody asked to join a guild the player administers. Like AS3, the window reads the
 * parser rather than the event.
 *
 * Name recovered from the emulator's `GroupMembershipRequestedMessageComposer = 2087`;
 * the AS3 class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2076.as
 */
export class GroupMembershipRequestedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GroupMembershipRequestedMessageParser);
    }

    /**
     * AS3 declares its own typed `getParser()`; `MessageEvent` here already provides a
     * generic one, so callers write `getParser<GroupMembershipRequestedMessageParser>()` rather than
     * having the type baked in. Overriding it would clash with the base signature.
     */
    // AS3: .../_SafeCls_2076.as::getParser()
}
