import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * GetGuildEditorDataMessageComposer (header 3398)
 *
 * Empty request; `HabboGroupsManager` sends it once, the first time a creation- or
 * edit-info payload arrives with no editor data cached yet.
 *
 * Name recovered from the emulator's `GetGuildEditorDataMessageEvent = 3398`; the AS3
 * class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_2038.as
 */
export class GetGuildEditorDataMessageComposer extends MessageComposer<[]>
{
    private _data: [] = [];

    // AS3: .../_SafeCls_2038.as::getMessageArray()
    getMessageArray(): []
    {
        return this._data;
    }
}
