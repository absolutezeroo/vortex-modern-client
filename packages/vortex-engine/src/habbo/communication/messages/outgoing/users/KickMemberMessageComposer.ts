import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * KickMemberMessageComposer (header 3156)
 *
 * Step two of the kick flow: removes the member, optionally blocking them from ever
 * rejoining. A player leaving a group sends this with their own id.
 *
 * Name recovered from the emulator's `KickMemberMessageEvent = 3156`; the AS3 class is
 * obfuscated in every available tree. Note the emulator's own comment on that constant:
 * 781 — the furni-count request this flow starts with — was once mistaken for the kick.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_2084.as
 */
export class KickMemberMessageComposer extends MessageComposer<[number, number, boolean]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_2084.as::_SafeStr_4556
    private _data: [number, number, boolean];

    // AS3: .../_SafeCls_2084.as::_SafeCls_2084()
    constructor(groupId: number, userId: number, block: boolean = false)
    {
        super();

        this._data = [groupId, userId, block];
    }

    // AS3: .../_SafeCls_2084.as::getMessageArray()
    getMessageArray(): [number, number, boolean]
    {
        return this._data;
    }
}
