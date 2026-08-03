import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * GuildMemberFurniCountInHQMessageParser
 *
 * How much furniture a member still has in the guild's HQ, answering
 * `GetMemberGuildItemCount`. Both member names are readable in the AS3; only the class
 * is obfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1891/_SafeCls_2467.as
 */
export class GuildMemberFurniCountInHQMessageParser implements IMessageParser
{
    private _userId: number = 0;
    private _furniCount: number = 0;

    // AS3: .../_SafeCls_2467.as::get userId()
    get userId(): number
    {
        return this._userId;
    }

    // AS3: .../_SafeCls_2467.as::get furniCount()
    get furniCount(): number
    {
        return this._furniCount;
    }

    // AS3: .../_SafeCls_2467.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../_SafeCls_2467.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._userId = wrapper.readInt();
        this._furniCount = wrapper.readInt();

        return true;
    }
}
