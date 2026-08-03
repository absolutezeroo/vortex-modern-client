import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * RejectMembershipRequestMessageComposer (header 3200)
 *
 * Turns down a pending membership request. Sent by the members list's remove icon when
 * the row is a request rather than a member.
 *
 * Name recovered from the emulator's `RejectMembershipRequestMessageEvent = 3200`; the AS3
 * class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_2681.as
 */
export class RejectMembershipRequestMessageComposer extends MessageComposer<[number, number]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_2681.as::_SafeStr_4556
    private _data: [number, number];

    // AS3: .../_SafeCls_2681.as::_SafeCls_2681()
    constructor(groupId: number, userId: number)
    {
        super();

        this._data = [groupId, userId];
    }

    // AS3: .../_SafeCls_2681.as::getMessageArray()
    getMessageArray(): [number, number]
    {
        return this._data;
    }
}
