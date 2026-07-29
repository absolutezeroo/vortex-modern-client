import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import type {GuildEditInfoData} from './GuildEditInfoData';
import {GuildEditInfoMessageParser} from '../../parser/users/GuildEditInfoMessageParser';

/**
 * GuildEditInfoMessageEvent (header 1288)
 *
 * The server's answer when an existing group is opened for editing.
 *
 * Name DERIVED from the handler it feeds (`HabboGroupsManager::onGuildEditInfo()`); the
 * AS3 class is obfuscated in every available tree and did not exist in the 2016
 * PRODUCTION build.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2303.as
 */
export class GuildEditInfoMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GuildEditInfoMessageParser);
    }

    // AS3: .../_SafeCls_2303.as::get data()
    get data(): GuildEditInfoData | null
    {
        return (this._parser as GuildEditInfoMessageParser).data;
    }
}
