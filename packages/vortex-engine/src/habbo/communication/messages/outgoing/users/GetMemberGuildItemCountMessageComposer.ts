import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * GetMemberGuildItemCountMessageComposer (header 781)
 *
 * Step one of kicking, blocking or leaving: ask how much furniture the target still has
 * in the guild's HQ. The count comes back as `GuildMemberFurniCountInHQ` and decides
 * which of the four confirmation texts the player is shown — nothing is removed until
 * that confirmation is accepted.
 *
 * Name recovered from the emulator's `GetMemberGuildItemCountMessageEvent = 781`; the
 * AS3 class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_1795.as
 */
export class GetMemberGuildItemCountMessageComposer extends MessageComposer<[number, number]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_1795.as::_SafeStr_4556
    private _data: [number, number];

    // AS3: .../_SafeCls_1795.as::_SafeCls_1795()
    constructor(groupId: number, userId: number)
    {
        super();

        this._data = [groupId, userId];
    }

    // AS3: .../_SafeCls_1795.as::getMessageArray()
    getMessageArray(): [number, number]
    {
        return this._data;
    }
}
