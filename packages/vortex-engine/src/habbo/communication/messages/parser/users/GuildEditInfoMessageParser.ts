import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {GuildEditInfoData} from '../../incoming/users/GuildEditInfoData';

/**
 * GuildEditInfoMessageParser
 *
 * Name DERIVED from the event it backs — the AS3 parser is obfuscated in every
 * available tree and did not exist in the 2016 PRODUCTION build.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1891/_SafeCls_3279.as
 */
export class GuildEditInfoMessageParser implements IMessageParser
{
    private _data: GuildEditInfoData | null = null;

    // AS3: .../_SafeCls_3279.as::get data()
    get data(): GuildEditInfoData | null
    {
        return this._data;
    }

    // AS3: .../_SafeCls_3279.as::flush()
    flush(): boolean
    {
        this._data = null;

        return true;
    }

    // AS3: .../_SafeCls_3279.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._data = new GuildEditInfoData(wrapper);

        return true;
    }
}
