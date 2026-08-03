import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * GuildMembershipRejectedMessageParser
 *
 * A membership request that was turned down. Identical on the wire to
 * `GuildMemberMgmtFailed`'s pair of integers, but the second is a user id, not a reason.
 *
 * Name DERIVED from the handler it feeds (`GuildMembersWindowCtrl::onGuildMembershipRejected()`)
 * and the emulator's `GuildMembershipRejectedMessageComposer = 595`; the AS3 class is
 * obfuscated in every available tree. Both members are recovered.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1891/_SafeCls_2714.as
 */
export class GuildMembershipRejectedMessageParser implements IMessageParser
{
    private _guildId: number = 0;
    private _userId: number = 0;

    // AS3: .../_SafeCls_2714.as::get guildId()
    get guildId(): number
    {
        return this._guildId;
    }

    // AS3: .../_SafeCls_2714.as::get userId()
    get userId(): number
    {
        return this._userId;
    }

    // AS3: .../_SafeCls_2714.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../_SafeCls_2714.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._guildId = wrapper.readInt();
        this._userId = wrapper.readInt();

        return true;
    }
}
