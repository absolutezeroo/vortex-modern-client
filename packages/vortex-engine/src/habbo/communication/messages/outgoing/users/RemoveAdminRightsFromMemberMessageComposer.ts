import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * RemoveAdminRightsFromMemberMessageComposer (header 3999)
 *
 * Demotes an admin back to plain member.
 *
 * Name recovered from the emulator's `RemoveAdminRightsFromMemberMessageEvent = 3999`; the AS3
 * class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_3648.as
 */
export class RemoveAdminRightsFromMemberMessageComposer extends MessageComposer<[number, number]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_3648.as::_SafeStr_4556
    private _data: [number, number];

    // AS3: .../_SafeCls_3648.as::_SafeCls_3648()
    constructor(groupId: number, userId: number)
    {
        super();

        this._data = [groupId, userId];
    }

    // AS3: .../_SafeCls_3648.as::getMessageArray()
    getMessageArray(): [number, number]
    {
        return this._data;
    }
}
