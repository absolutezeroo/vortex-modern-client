import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * AddAdminRightsToMemberMessageComposer (header 2152)
 *
 * Promotes a member to admin.
 *
 * Name recovered from the emulator's `AddAdminRightsToMemberMessageEvent = 2152`; the AS3
 * class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_3129.as
 */
export class AddAdminRightsToMemberMessageComposer extends MessageComposer<[number, number]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_3129.as::_SafeStr_4556
    private _data: [number, number];

    // AS3: .../_SafeCls_3129.as::_SafeCls_3129()
    constructor(groupId: number, userId: number)
    {
        super();

        this._data = [groupId, userId];
    }

    // AS3: .../_SafeCls_3129.as::getMessageArray()
    getMessageArray(): [number, number]
    {
        return this._data;
    }
}
