import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * GuildMemberEntryData
 *
 * One row of the members list. Everything the UI branches on comes from a single role
 * integer, which is why `member` is "not a pending request" rather than a rank of its own.
 *
 * Class name DERIVED: the AS3 class is obfuscated in the WIN63 tree and still obfuscated
 * in the 2016 PRODUCTION build (`_Str_2891`), so no tree carries it. Every member name
 * below is recovered from the AS3 getters.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_1983.as
 */
export class GuildMemberEntryData
{
    /**
     * The five role values. AS3 declares them as five obfuscated constants and never
     * references them — the getters below compare against the literals instead — so the
     * names here are DERIVED from what each getter tests for. `MEMBER` (2) is the one
     * value no getter names: it is what is left when a row is neither owner, admin,
     * requested nor blocked.
     */
    // AS3: .../_SafeCls_1983.as::_SafeStr_11033
    public static readonly ROLE_OWNER: number = 0;
    // AS3: .../_SafeCls_1983.as::_SafeStr_10565
    public static readonly ROLE_ADMIN: number = 1;
    // AS3: .../_SafeCls_1983.as::_SafeStr_11138
    public static readonly ROLE_MEMBER: number = 2;
    // AS3: .../_SafeCls_1983.as::_SafeStr_10618
    public static readonly ROLE_REQUESTED: number = 3;
    // AS3: .../_SafeCls_1983.as::_SafeStr_11269
    public static readonly ROLE_BLOCKED: number = 4;

    // AS3: .../_SafeCls_1983.as::_SafeStr_4778
    private _role: number = 0;

    // AS3: .../_SafeCls_1983.as::_SafeStr_5971
    private _userId: number = 0;

    // AS3: .../_SafeCls_1983.as::_userName
    private _userName: string = '';

    // AS3: .../_SafeCls_1983.as::_SafeStr_5551
    private _figure: string = '';

    // AS3: .../_SafeCls_1983.as::_SafeStr_9398
    private _memberSince: string = '';

    // AS3: .../_SafeCls_1983.as::_SafeCls_1983()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._role = wrapper.readInt();
        this._userId = wrapper.readInt();
        this._userName = wrapper.readString();
        this._figure = wrapper.readString();
        this._memberSince = wrapper.readString();
    }

    // AS3: .../_SafeCls_1983.as::get userId()
    get userId(): number
    {
        return this._userId;
    }

    // AS3: .../_SafeCls_1983.as::get userName()
    get userName(): string
    {
        return this._userName;
    }

    // AS3: .../_SafeCls_1983.as::get admin()
    get admin(): boolean
    {
        return this._role === GuildMemberEntryData.ROLE_ADMIN;
    }

    // AS3: .../_SafeCls_1983.as::get owner()
    get owner(): boolean
    {
        return this._role === GuildMemberEntryData.ROLE_OWNER;
    }

    /** A blocked user is still a member here — only a pending request is not. */
    // AS3: .../_SafeCls_1983.as::get member()
    get member(): boolean
    {
        return this._role !== GuildMemberEntryData.ROLE_REQUESTED;
    }

    // AS3: .../_SafeCls_1983.as::get blocked()
    get blocked(): boolean
    {
        return this._role === GuildMemberEntryData.ROLE_BLOCKED;
    }

    // AS3: .../_SafeCls_1983.as::get figure()
    get figure(): string
    {
        return this._figure;
    }

    // AS3: .../_SafeCls_1983.as::get memberSince()
    get memberSince(): string
    {
        return this._memberSince;
    }
}
