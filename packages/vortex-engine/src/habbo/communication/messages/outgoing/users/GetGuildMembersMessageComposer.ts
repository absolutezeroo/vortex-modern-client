import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * GetGuildMembersMessageComposer (header 1337)
 *
 * Asks for one page of a guild's members, filtered by name and by type. The reply,
 * `GuildMembers` (403), is also what opens the window — there is no separate open message.
 *
 * Name recovered from the emulator's `GetGuildMembersMessageEvent = 1337`; the AS3 class
 * is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_2908.as
 */
export class GetGuildMembersMessageComposer extends MessageComposer<[number, number, string, number]>
{
    /**
     * The search types, matching the drop menu the window populates. AS3 declares three
     * obfuscated constants here and never references them — the window passes the menu's
     * selection index straight through — so these names are DERIVED from the localization
     * keys that fill that menu (`${group.members.search.all}` and friends). A fourth entry,
     * blocked, exists in the menu but has no constant in AS3.
     */
    // AS3: .../_SafeCls_2908.as::_SafeStr_10460
    public static readonly SEARCH_ALL: number = 0;
    // AS3: .../_SafeCls_2908.as::_SafeStr_10507
    public static readonly SEARCH_ADMINS: number = 1;
    // AS3: .../_SafeCls_2908.as::_SafeStr_11699
    public static readonly SEARCH_PENDING: number = 2;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_2908.as::_SafeStr_4556
    private _data: [number, number, string, number];

    // AS3: .../_SafeCls_2908.as::_SafeCls_2908()
    constructor(groupId: number, pageIndex: number, userNameFilter: string, searchType: number)
    {
        super();

        this._data = [groupId, pageIndex, userNameFilter, searchType];
    }

    // AS3: .../_SafeCls_2908.as::getMessageArray()
    getMessageArray(): [number, number, string, number]
    {
        return this._data;
    }
}
