import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * GuildCreatedMessageParser
 *
 * Name DERIVED from the handler it feeds (`HabboGroupsManager::onGuildCreated()`) — the
 * AS3 parser is obfuscated in every available tree and did not exist in the 2016
 * PRODUCTION build. `baseRoomId` / `groupId` are recovered.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1891/_SafeCls_2746.as
 */
export class GuildCreatedMessageParser implements IMessageParser
{
    private _baseRoomId: number = 0;
    private _groupId: number = 0;

    // AS3: .../_SafeCls_2746.as::get baseRoomId()
    get baseRoomId(): number
    {
        return this._baseRoomId;
    }

    // AS3: .../_SafeCls_2746.as::get groupId()
    get groupId(): number
    {
        return this._groupId;
    }

    // AS3: .../_SafeCls_2746.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../_SafeCls_2746.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._baseRoomId = wrapper.readInt();
        this._groupId = wrapper.readInt();

        return true;
    }
}
