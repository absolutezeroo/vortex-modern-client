import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import type {GuildMemberEntryData} from './GuildMemberEntryData';
import {
    GuildMembershipUpdatedMessageParser
} from '../../parser/users/GuildMembershipUpdatedMessageParser';

/**
 * GuildMembershipUpdatedMessageEvent (header 3477)
 *
 * A member's rank changed. The open list patches that one row and redraws, rather than
 * asking for the page again.
 *
 * Name recovered from the emulator's `GuildMembershipUpdatedMessageComposer = 3477`; the
 * AS3 class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_1730.as
 */
export class GuildMembershipUpdatedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GuildMembershipUpdatedMessageParser);
    }

    // AS3: .../_SafeCls_1730.as::get data()
    get data(): GuildMemberEntryData | null
    {
        return (this._parser as GuildMembershipUpdatedMessageParser).data;
    }

    // AS3: .../_SafeCls_1730.as::get guildId()
    get guildId(): number
    {
        return (this._parser as GuildMembershipUpdatedMessageParser).guildId;
    }
}
