import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {GuildMemberEntryData} from '../../incoming/users/GuildMemberEntryData';

/**
 * GroupMembershipRequestedMessageParser
 *
 * Somebody asked to join. The requester arrives as a full member row, so an open list
 * showing pending requests can refresh itself.
 *
 * Name recovered from the emulator's `GroupMembershipRequestedMessageComposer = 2087`;
 * the AS3 class is obfuscated in every available tree. Both members are recovered.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1891/_SafeCls_2858.as
 */
export class GroupMembershipRequestedMessageParser implements IMessageParser
{
    private _groupId: number = 0;
    private _requester: GuildMemberEntryData | null = null;

    // AS3: .../_SafeCls_2858.as::get groupId()
    get groupId(): number
    {
        return this._groupId;
    }

    // AS3: .../_SafeCls_2858.as::get requester()
    get requester(): GuildMemberEntryData | null
    {
        return this._requester;
    }

    // AS3: .../_SafeCls_2858.as::flush()
    flush(): boolean
    {
        this._requester = null;

        return true;
    }

    // AS3: .../_SafeCls_2858.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._groupId = wrapper.readInt();
        this._requester = new GuildMemberEntryData(wrapper);

        return true;
    }
}
