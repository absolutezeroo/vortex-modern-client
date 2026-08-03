import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * DeactivateGuildMessageComposer (header 2725)
 *
 * Deletes a guild, sent once the player confirms `${group.deleteconfirm.title}`. The
 * reply is the ordinary `HabboGroupDeactivated` broadcast, which is what closes every
 * window still showing the group.
 *
 * Name recovered from the emulator's `DeactivateGuildMessageEvent = 2725`; the AS3 class
 * is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_2811.as
 */
export class DeactivateGuildMessageComposer extends MessageComposer<[number]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_2811.as::_SafeStr_8144
    private _groupId: number;

    // AS3: .../_SafeCls_2811.as::_SafeCls_2811()
    constructor(groupId: number)
    {
        super();

        this._groupId = groupId;
    }

    // AS3: .../_SafeCls_2811.as::getMessageArray()
    getMessageArray(): [number]
    {
        return [this._groupId];
    }
}
