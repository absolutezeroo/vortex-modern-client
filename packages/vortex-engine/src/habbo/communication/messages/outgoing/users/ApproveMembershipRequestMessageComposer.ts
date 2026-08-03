import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * ApproveMembershipRequestMessageComposer (header 3505)
 *
 * Accepts one pending membership request.
 *
 * Name recovered from the emulator's `ApproveMembershipRequestMessageEvent = 3505`; the AS3
 * class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_3772.as
 */
export class ApproveMembershipRequestMessageComposer extends MessageComposer<[number, number]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_3772.as::_SafeStr_4556
    private _data: [number, number];

    // AS3: .../_SafeCls_3772.as::_SafeCls_3772()
    constructor(groupId: number, userId: number)
    {
        super();

        this._data = [groupId, userId];
    }

    // AS3: .../_SafeCls_3772.as::getMessageArray()
    getMessageArray(): [number, number]
    {
        return this._data;
    }
}
