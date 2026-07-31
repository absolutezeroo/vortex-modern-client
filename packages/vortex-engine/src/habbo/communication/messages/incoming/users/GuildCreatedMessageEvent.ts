import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GuildCreatedMessageParser} from '../../parser/users/GuildCreatedMessageParser';

/**
 * GuildCreatedMessageEvent (header 2138)
 *
 * Confirms the group was created: closes the wizard, opens the congratulations window
 * and — if the player is not already standing in it — walks them to the new base room.
 *
 * Name DERIVED from the handler it feeds (`HabboGroupsManager::onGuildCreated()`),
 * corroborated by the emulator's `GuildCreatedMessageComposer = 2138`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_1940.as
 */
export class GuildCreatedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GuildCreatedMessageParser);
    }

    // AS3: .../_SafeCls_1940.as::get baseRoomId()
    get baseRoomId(): number
    {
        return (this._parser as GuildCreatedMessageParser).baseRoomId;
    }

    // AS3: .../_SafeCls_1940.as::get groupId()
    get groupId(): number
    {
        return (this._parser as GuildCreatedMessageParser).groupId;
    }
}
