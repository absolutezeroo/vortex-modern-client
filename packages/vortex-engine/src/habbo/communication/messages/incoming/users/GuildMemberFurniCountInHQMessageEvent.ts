import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    GuildMemberFurniCountInHQMessageParser
} from '../../parser/users/GuildMemberFurniCountInHQMessageParser';

/**
 * GuildMemberFurniCountInHQMessageEvent (header 1402)
 *
 * The answer to `GetMemberGuildItemCount`, and the trigger for the kick/leave
 * confirmation: the count picks which of the four texts is shown, and the user id says
 * whether the player is removing themselves or someone else.
 *
 * Name recovered from the emulator's `GuildMemberFurniCountInHQMessageComposer = 1402`;
 * the AS3 class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2145.as
 */
export class GuildMemberFurniCountInHQMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GuildMemberFurniCountInHQMessageParser);
    }

    // AS3: .../_SafeCls_2145.as::userId()
    get userId(): number
    {
        return (this._parser as GuildMemberFurniCountInHQMessageParser).userId;
    }

    // AS3: .../_SafeCls_2145.as::furniCount()
    get furniCount(): number
    {
        return (this._parser as GuildMemberFurniCountInHQMessageParser).furniCount;
    }
}
