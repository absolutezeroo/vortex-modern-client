import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import type {GuildMembership} from './GuildMembership';
import {GuildMembershipsMessageEventParser} from '../../parser/users/GuildMembershipsMessageEventParser';

/**
 * AS3: sources/win63_version/habbo/communication/messages/incoming/users/GuildMembershipsMessageEvent.as
 */
export class GuildMembershipsMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GuildMembershipsMessageEventParser);
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/users/GuildMembershipsMessageEvent.as::get guilds()
    get guilds(): GuildMembership[]
    {
        return (this._parser as GuildMembershipsMessageEventParser).guilds;
    }
}
