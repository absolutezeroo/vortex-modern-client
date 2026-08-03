import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {GuildMemberEntryData} from '../../incoming/users/GuildMemberEntryData';

/**
 * GuildMembershipUpdatedMessageParser
 *
 * One member's row after a rank change, so an open list can be patched in place instead
 * of re-requesting the page.
 *
 * Name DERIVED from the handler it feeds (`GuildMembersWindowCtrl::onGuildMembershipUpdated()`)
 * and the emulator's `GuildMembershipUpdatedMessageComposer = 3477`; the AS3 class is
 * obfuscated in every available tree. Both members are recovered.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1891/_SafeCls_3499.as
 */
export class GuildMembershipUpdatedMessageParser implements IMessageParser
{
    private _guildId: number = 0;
    private _data: GuildMemberEntryData | null = null;

    // AS3: .../_SafeCls_3499.as::get guildId()
    get guildId(): number
    {
        return this._guildId;
    }

    // AS3: .../_SafeCls_3499.as::get data()
    get data(): GuildMemberEntryData | null
    {
        return this._data;
    }

    // AS3: .../_SafeCls_3499.as::flush()
    flush(): boolean
    {
        this._data = null;

        return true;
    }

    // AS3: .../_SafeCls_3499.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._guildId = wrapper.readInt();
        this._data = new GuildMemberEntryData(wrapper);

        return true;
    }
}
