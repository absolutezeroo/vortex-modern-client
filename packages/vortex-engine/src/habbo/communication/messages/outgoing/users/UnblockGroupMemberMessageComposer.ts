import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * UnblockGroupMemberMessageComposer (header 2580)
 *
 * Lifts a block, letting the user apply again. The members list reaches it through the
 * action link, which reads "unblock" while the row is blocked.
 *
 * Name recovered from the emulator's `UnblockGroupMemberMessageEvent = 2580`; the AS3
 * class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_2867.as
 */
export class UnblockGroupMemberMessageComposer extends MessageComposer<[number, number]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_2867.as::_SafeStr_4556
    private _data: [number, number];

    // AS3: .../_SafeCls_2867.as::_SafeCls_2867()
    constructor(groupId: number, userId: number)
    {
        super();

        this._data = [groupId, userId];
    }

    // AS3: .../_SafeCls_2867.as::getMessageArray()
    getMessageArray(): [number, number]
    {
        return this._data;
    }
}
