import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * UpdateGuildColorsMessageComposer (header 3421)
 *
 * Saves the primary/secondary guild colours of an existing group.
 *
 * Name DERIVED from its use site (`GuildManagementWindowCtrl::saveView()`, colours
 * view); the AS3 class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_2420.as
 */
export class UpdateGuildColorsMessageComposer extends MessageComposer<[number, number, number]>
{
    private _data: [number, number, number];

    // AS3: .../_SafeCls_2420.as::_SafeCls_2420()
    constructor(groupId: number, primaryColorId: number, secondaryColorId: number)
    {
        super();

        this._data = [groupId, primaryColorId, secondaryColorId];
    }

    // AS3: .../_SafeCls_2420.as::getMessageArray()
    getMessageArray(): [number, number, number]
    {
        return this._data;
    }
}
