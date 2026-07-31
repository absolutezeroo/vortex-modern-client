import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import type {GuildCreationInfoData} from './GuildCreationInfoData';
import {GuildCreationInfoMessageParser} from '../../parser/users/GuildCreationInfoMessageParser';

/**
 * GuildCreationInfoMessageEvent (header 973)
 *
 * The server's answer to GetGuildCreationInfo, i.e. the payload that opens the group
 * creation wizard.
 *
 * Name DERIVED from the handler it feeds (`HabboGroupsManager::onGuildCreationInfo()`),
 * corroborated by the emulator's `GuildCreationInfoMessageComposer = 973`; the AS3 class
 * is obfuscated in every available tree and did not exist in the 2016 PRODUCTION build.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2173.as
 */
export class GuildCreationInfoMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GuildCreationInfoMessageParser);
    }

    // AS3: .../_SafeCls_2173.as::get data()
    get data(): GuildCreationInfoData | null
    {
        return (this._parser as GuildCreationInfoMessageParser).data;
    }
}
