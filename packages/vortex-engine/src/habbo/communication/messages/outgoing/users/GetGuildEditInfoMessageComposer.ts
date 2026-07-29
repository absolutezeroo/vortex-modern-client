import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * GetGuildEditInfoMessageComposer (header 874)
 *
 * Asks for an existing group's settings so the management window can open in edit mode.
 * The reply is `GuildEditInfoMessageEvent` (1288) — the same window the creation wizard
 * uses, driven from the other side of `IGuildManagementData.exists`.
 *
 * Name recovered from the emulator's `GetGuildEditInfoMessageEvent = 874`; the AS3 class
 * is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_2905.as
 */
export class GetGuildEditInfoMessageComposer extends MessageComposer<[number]>
{
    private _data: [number];

    // AS3: .../_SafeCls_2905.as::_SafeCls_2905()
    constructor(groupId: number)
    {
        super();

        this._data = [groupId];
    }

    // AS3: .../_SafeCls_2905.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
