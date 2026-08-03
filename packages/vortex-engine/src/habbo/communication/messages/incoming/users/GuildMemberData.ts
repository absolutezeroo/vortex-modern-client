import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {GuildMemberEntryData} from './GuildMemberEntryData';

/**
 * GuildMemberData
 *
 * One page of a guild's member list, plus the search that produced it — the filter text
 * and type come back with the results so the window can restore its own controls from the
 * reply rather than from what the player last typed.
 *
 * Despite the singular name this is the whole page; the rows are `entries`. That name is
 * not a choice: it is the class's real one, recovered from the 2016 PRODUCTION build
 * (`communication/messages/incoming/users/GuildMemberData.as`), which also recovers every
 * field below. Only the row class stayed obfuscated in both trees — see
 * `GuildMemberEntryData`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2096.as
 */
export class GuildMemberData
{
    // AS3: .../_SafeCls_2096.as::_groupId
    private _groupId: number = 0;

    // AS3: .../_SafeCls_2096.as::_groupName
    private _groupName: string = '';

    // AS3: .../_SafeCls_2096.as::_SafeStr_8901 (PRODUCTION: _baseRoomId)
    private _baseRoomId: number = 0;

    // AS3: .../_SafeCls_2096.as::_badgeCode
    private _badgeCode: string = '';

    // AS3: .../_SafeCls_2096.as::_totalEntries
    private _totalEntries: number = 0;

    // AS3: .../_SafeCls_2096.as::_entries
    private _entries: GuildMemberEntryData[] = [];

    // AS3: .../_SafeCls_2096.as::_SafeStr_9039 (PRODUCTION: _allowedToManage)
    private _allowedToManage: boolean = false;

    // AS3: .../_SafeCls_2096.as::_SafeStr_8389 (PRODUCTION: _pageSize)
    private _pageSize: number = 0;

    // AS3: .../_SafeCls_2096.as::_SafeStr_4726 (PRODUCTION: _pageIndex)
    private _pageIndex: number = 0;

    // AS3: .../_SafeCls_2096.as::_SafeStr_5470 (PRODUCTION: _searchType)
    private _searchType: number = 0;

    // AS3: .../_SafeCls_2096.as::_SafeStr_5423 (PRODUCTION: _userNameFilter)
    private _userNameFilter: string = '';

    // AS3: .../_SafeCls_2096.as::_SafeStr_6969 (PRODUCTION: _usersById)
    private _usersById: Map<number, GuildMemberEntryData> = new Map();

    // AS3: .../_SafeCls_2096.as::_SafeCls_2096()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._groupId = wrapper.readInt();
        this._groupName = wrapper.readString();
        this._baseRoomId = wrapper.readInt();
        this._badgeCode = wrapper.readString();
        this._totalEntries = wrapper.readInt();

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const entry = new GuildMemberEntryData(wrapper);

            this._entries.push(entry);
            this._usersById.set(entry.userId, entry);
        }

        this._allowedToManage = wrapper.readBoolean();
        this._pageSize = wrapper.readInt();
        this._pageIndex = wrapper.readInt();
        this._searchType = wrapper.readInt();
        this._userNameFilter = wrapper.readString();
    }

    // AS3: .../_SafeCls_2096.as::removeFromArray()
    private static removeFromArray(userId: number, entries: GuildMemberEntryData[]): void
    {
        let index = 0;

        while(index < entries.length)
        {
            if(entries[index].userId === userId) entries.splice(index, 1);
            else index++;
        }
    }

    // AS3: .../_SafeCls_2096.as::get groupId()
    get groupId(): number
    {
        return this._groupId;
    }

    // AS3: .../_SafeCls_2096.as::get groupName()
    get groupName(): string
    {
        return this._groupName;
    }

    // AS3: .../_SafeCls_2096.as::get baseRoomId()
    get baseRoomId(): number
    {
        return this._baseRoomId;
    }

    // AS3: .../_SafeCls_2096.as::get badgeCode()
    get badgeCode(): string
    {
        return this._badgeCode;
    }

    // AS3: .../_SafeCls_2096.as::get totalEntries()
    get totalEntries(): number
    {
        return this._totalEntries;
    }

    // AS3: .../_SafeCls_2096.as::get pageSize()
    get pageSize(): number
    {
        return this._pageSize;
    }

    // AS3: .../_SafeCls_2096.as::get pageIndex()
    get pageIndex(): number
    {
        return this._pageIndex;
    }

    // AS3: .../_SafeCls_2096.as::get searchType()
    get searchType(): number
    {
        return this._searchType;
    }

    // AS3: .../_SafeCls_2096.as::get entries()
    get entries(): GuildMemberEntryData[]
    {
        return this._entries;
    }

    // AS3: .../_SafeCls_2096.as::get allowedToManage()
    get allowedToManage(): boolean
    {
        return this._allowedToManage;
    }

    // AS3: .../_SafeCls_2096.as::get userNameFilter()
    get userNameFilter(): string
    {
        return this._userNameFilter;
    }

    // AS3: .../_SafeCls_2096.as::get totalPages()
    get totalPages(): number
    {
        return Math.max(1, Math.ceil(this._totalEntries / this._pageSize));
    }

    /** Replaces the row in place if the user is already listed, appends it otherwise. */
    // AS3: .../_SafeCls_2096.as::update()
    update(entry: GuildMemberEntryData): void
    {
        this._usersById.set(entry.userId, entry);

        for(let index = 0; index < this._entries.length; index++)
        {
            if(this._entries[index].userId === entry.userId)
            {
                this._entries[index] = entry;

                return;
            }
        }

        this._entries.push(entry);
    }

    // AS3: .../_SafeCls_2096.as::remove()
    remove(userId: number): void
    {
        GuildMemberData.removeFromArray(userId, this._entries);
        this._usersById.delete(userId);
    }

    // AS3: .../_SafeCls_2096.as::getUser()
    getUser(userId: number): GuildMemberEntryData | null
    {
        return this._usersById.get(userId) ?? null;
    }
}
