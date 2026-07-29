import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {GuildEditorData} from '../../incoming/users/GuildEditorData';

/**
 * GuildEditorDataMessageParser
 *
 * Name DERIVED from the data it produces; the 2016 PRODUCTION build has the same parser
 * under an obfuscated name (`parser/users/_Str_9569.as`) but its `GuildEditorData`
 * payload class is unobfuscated there.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1891/_SafeCls_3406.as
 */
export class GuildEditorDataMessageParser implements IMessageParser
{
    private _data: GuildEditorData | null = null;

    // AS3: .../_SafeCls_3406.as::get data()
    get data(): GuildEditorData | null
    {
        return this._data;
    }

    // AS3: .../_SafeCls_3406.as::flush()
    flush(): boolean
    {
        this._data = null;

        return true;
    }

    // AS3: .../_SafeCls_3406.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._data = new GuildEditorData(wrapper);

        return true;
    }
}
