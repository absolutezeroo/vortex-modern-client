import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * ApproveAllMembershipRequestsMessageComposer (header 1621)
 *
 * Accepts every pending request at once. AS3 binds it to an `accept_all` button the
 * members layout carries but `GuildMembersWindowCtrl` never wires up — `onAcceptAll()` is
 * declared and never installed as a procedure — so nothing in the ported UI sends it
 * either.
 *
 * Name recovered from the emulator's `ApproveAllMembershipRequestsMessageEvent = 1621`;
 * the AS3 class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_2425.as
 */
export class ApproveAllMembershipRequestsMessageComposer extends MessageComposer<[number]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_2425.as::_SafeStr_4556
    private _data: [number];

    // AS3: .../_SafeCls_2425.as::_SafeCls_2425()
    constructor(groupId: number)
    {
        super();

        this._data = [groupId];
    }

    // AS3: .../_SafeCls_2425.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
