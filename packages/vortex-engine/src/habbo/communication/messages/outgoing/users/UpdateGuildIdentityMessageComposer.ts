import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * UpdateGuildIdentityMessageComposer (header 2009)
 *
 * Saves the name and description of an existing group when the edit window leaves its
 * identity tab.
 *
 * Name DERIVED from its use site (`GuildManagementWindowCtrl::saveView()`, identity
 * view); the AS3 class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_3413.as
 */
export class UpdateGuildIdentityMessageComposer extends MessageComposer<[number, string, string]>
{
    private _data: [number, string, string];

    // AS3: .../_SafeCls_3413.as::_SafeCls_3413()
    constructor(groupId: number, name: string, description: string)
    {
        super();

        this._data = [groupId, name, description];
    }

    // AS3: .../_SafeCls_3413.as::getMessageArray()
    getMessageArray(): [number, string, string]
    {
        return this._data;
    }
}
