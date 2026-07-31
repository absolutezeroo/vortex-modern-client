import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * GuildEditFailedMessageParser
 *
 * Name DERIVED from the handler it feeds (`HabboGroupsManager::onGuildEditFailed()`) —
 * the AS3 parser is obfuscated in every available tree and did not exist in the 2016
 * PRODUCTION build. `reason` is recovered.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1891/_SafeCls_2310.as
 */
export class GuildEditFailedMessageParser implements IMessageParser
{
    /**
     * The reason code that means "this needs an active HC subscription", which is the
     * one reason `HabboGroupsManager` answers with the HC-required window instead of a
     * generic alert. The AS3 constant is obfuscated (`_SafeStr_10329`); this name is
     * DERIVED from that single use site.
     *
     * AS3: .../_SafeCls_2310.as::_SafeStr_10329
     */
    public static readonly REASON_HC_REQUIRED: number = 2;

    private _reason: number = 0;

    // AS3: .../_SafeCls_2310.as::get reason()
    get reason(): number
    {
        return this._reason;
    }

    // AS3: .../_SafeCls_2310.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../_SafeCls_2310.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._reason = wrapper.readInt();

        return true;
    }
}
