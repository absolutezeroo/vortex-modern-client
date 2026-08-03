import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    GuildMemberMgmtFailedMessageParser
} from '../../parser/users/GuildMemberMgmtFailedMessageParser';

/**
 * GuildMemberMgmtFailedMessageEvent (header 1735)
 *
 * A member action the server refused. It alerts, then re-runs the current search so the
 * list stops showing whatever state the client had assumed.
 *
 * Name recovered from the emulator's `GuildMemberMgmtFailedMessageComposer = 1735`; the
 * AS3 class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_1768.as
 */
export class GuildMemberMgmtFailedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GuildMemberMgmtFailedMessageParser);
    }

    // AS3: .../_SafeCls_1768.as::get reason()
    get reason(): number
    {
        return (this._parser as GuildMemberMgmtFailedMessageParser).reason;
    }

    // AS3: .../_SafeCls_1768.as::get guildId()
    get guildId(): number
    {
        return (this._parser as GuildMemberMgmtFailedMessageParser).guildId;
    }
}
