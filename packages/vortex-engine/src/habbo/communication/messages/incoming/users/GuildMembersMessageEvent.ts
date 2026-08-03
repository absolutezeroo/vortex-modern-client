import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import type {GuildMemberData} from './GuildMemberData';
import {GuildMembersMessageParser} from '../../parser/users/GuildMembersMessageParser';

/**
 * GuildMembersMessageEvent (header 403)
 *
 * One page of a guild's member list, answering `GetGuildMembers`. This is also what opens
 * the members window: the request is sent on click and the window is built from the reply.
 *
 * Name recovered from the 2016 PRODUCTION build's `GuildMembersEvent` and the emulator's
 * `GuildMembersMessageComposer = 403`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2233.as
 */
export class GuildMembersMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GuildMembersMessageParser);
    }

    // AS3: .../_SafeCls_2233.as::get data()
    get data(): GuildMemberData | null
    {
        return (this._parser as GuildMembersMessageParser).data;
    }
}
