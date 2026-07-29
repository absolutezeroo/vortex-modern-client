import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {GuildCreationInfoData} from '../../incoming/users/GuildCreationInfoData';

/**
 * GuildCreationInfoMessageParser
 *
 * Name DERIVED from the event it backs — the AS3 parser is obfuscated in every
 * available tree and did not exist in the 2016 PRODUCTION build.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1891/_SafeCls_3594.as
 */
export class GuildCreationInfoMessageParser implements IMessageParser
{
    private _data: GuildCreationInfoData | null = null;

    // AS3: .../_SafeCls_3594.as::get data()
    get data(): GuildCreationInfoData | null
    {
        return this._data;
    }

    // AS3: .../_SafeCls_3594.as::flush()
    flush(): boolean
    {
        this._data = null;

        return true;
    }

    // AS3: .../_SafeCls_3594.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._data = new GuildCreationInfoData(wrapper);

        return true;
    }
}
