import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {GuildMemberData} from '../../incoming/users/GuildMemberData';

/**
 * GuildMembersMessageParser
 *
 * The whole payload is `GuildMemberData`'s constructor; this only holds the result.
 *
 * Name DERIVED from the event that takes it (`GuildMembersEvent` in the 2016 PRODUCTION
 * build) — the parser class itself is obfuscated in every available tree, PRODUCTION
 * included (`_Str_9168`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1891/_SafeCls_2779.as
 */
export class GuildMembersMessageParser implements IMessageParser
{
    private _data: GuildMemberData | null = null;

    // AS3: .../_SafeCls_2779.as::get data()
    get data(): GuildMemberData | null
    {
        return this._data;
    }

    // AS3: .../_SafeCls_2779.as::flush()
    flush(): boolean
    {
        this._data = null;

        return true;
    }

    // AS3: .../_SafeCls_2779.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._data = new GuildMemberData(wrapper);

        return true;
    }
}
