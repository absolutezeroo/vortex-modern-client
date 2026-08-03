import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * GuildMemberMgmtFailedMessageParser
 *
 * A refused member action. The reason becomes the localization key
 * `group.membermgmt.fail.<reason>`, so no enum is needed on this side.
 *
 * Name DERIVED from the handler it feeds (`GuildMembersWindowCtrl::onGuildMemberMgmtFailed()`)
 * and the emulator's `GuildMemberMgmtFailedMessageComposer = 1735`; the AS3 class is
 * obfuscated in every available tree. Both members are recovered.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1891/_SafeCls_2837.as
 */
export class GuildMemberMgmtFailedMessageParser implements IMessageParser
{
    private _guildId: number = 0;
    private _reason: number = 0;

    // AS3: .../_SafeCls_2837.as::get guildId()
    get guildId(): number
    {
        return this._guildId;
    }

    // AS3: .../_SafeCls_2837.as::get reason()
    get reason(): number
    {
        return this._reason;
    }

    // AS3: .../_SafeCls_2837.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../_SafeCls_2837.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._guildId = wrapper.readInt();
        this._reason = wrapper.readInt();

        return true;
    }
}
