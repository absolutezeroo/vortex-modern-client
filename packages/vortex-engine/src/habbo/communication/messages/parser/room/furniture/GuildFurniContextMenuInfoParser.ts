/**
 * GuildFurniContextMenuInfoParser
 *
 * The guild behind a guild-customised furni: everything the context bubble needs to decide
 * which of its two buttons to show.
 *
 * Class name DERIVED — the AS3 parser is `_SafePkg_2942::_SafeCls_4359`, obfuscated in every
 * tree, and named here after the event it parses. Its own getters are readable and kept verbatim.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4359.as
 */
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

export class GuildFurniContextMenuInfoParser implements IMessageParser
{
    // AS3: .../src/unknowns/_SafePkg_2942/_SafeCls_4359.as::_SafeStr_4841
    private _objectId: number = -1;
    // AS3: .../src/unknowns/_SafePkg_2942/_SafeCls_4359.as::_SafeStr_8144
    private _guildId: number = -1;
    // AS3: .../src/unknowns/_SafePkg_2942/_SafeCls_4359.as::_SafeStr_7755
    private _guildName: string = '';
    // AS3: .../src/unknowns/_SafePkg_2942/_SafeCls_4359.as::_SafeStr_7965
    private _guildHomeRoomId: number = -1;
    // AS3: .../src/unknowns/_SafePkg_2942/_SafeCls_4359.as::_SafeStr_8163
    private _userIsMember: boolean = false;
    // AS3: .../src/unknowns/_SafePkg_2942/_SafeCls_4359.as::_SafeStr_7709
    private _guildHasReadableForum: boolean = false;

    // AS3: .../src/unknowns/_SafePkg_2942/_SafeCls_4359.as::get objectId()
    get objectId(): number
    {
        return this._objectId;
    }

    // AS3: .../src/unknowns/_SafePkg_2942/_SafeCls_4359.as::get guildId()
    get guildId(): number
    {
        return this._guildId;
    }

    // AS3: .../src/unknowns/_SafePkg_2942/_SafeCls_4359.as::get guildName()
    get guildName(): string
    {
        return this._guildName;
    }

    // AS3: .../src/unknowns/_SafePkg_2942/_SafeCls_4359.as::get guildHomeRoomId()
    get guildHomeRoomId(): number
    {
        return this._guildHomeRoomId;
    }

    // AS3: .../src/unknowns/_SafePkg_2942/_SafeCls_4359.as::get userIsMember()
    get userIsMember(): boolean
    {
        return this._userIsMember;
    }

    // AS3: .../src/unknowns/_SafePkg_2942/_SafeCls_4359.as::get guildHasReadableForum()
    get guildHasReadableForum(): boolean
    {
        return this._guildHasReadableForum;
    }

    // AS3: .../src/unknowns/_SafePkg_2942/_SafeCls_4359.as::flush()
    flush(): boolean
    {
        this._objectId = -1;
        this._guildId = -1;
        this._guildName = '';
        this._guildHomeRoomId = -1;
        this._userIsMember = false;
        this._guildHasReadableForum = false;

        return true;
    }

    // AS3: .../src/unknowns/_SafePkg_2942/_SafeCls_4359.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._objectId = wrapper.readInt();
        this._guildId = wrapper.readInt();
        this._guildName = wrapper.readString();
        this._guildHomeRoomId = wrapper.readInt();
        this._userIsMember = wrapper.readBoolean();
        this._guildHasReadableForum = wrapper.readBoolean();

        return true;
    }
}
