import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * UpdateGuildSettingsMessageComposer (header 3716)
 *
 * Saves who may join a group and who may decorate its base room — the edit window's
 * settings tab, which the creation wizard never reaches.
 *
 * Name DERIVED from its use site (`GuildManagementWindowCtrl::saveView()`, settings
 * view); the AS3 class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_3380.as
 */
export class UpdateGuildSettingsMessageComposer extends MessageComposer<[number, number, number]>
{
    private _data: [number, number, number];

    // AS3: .../_SafeCls_3380.as::_SafeCls_3380()
    constructor(groupId: number, guildType: number, rightsLevel: number)
    {
        super();

        this._data = [groupId, guildType, rightsLevel];
    }

    // AS3: .../_SafeCls_3380.as::getMessageArray()
    getMessageArray(): [number, number, number]
    {
        return this._data;
    }
}
