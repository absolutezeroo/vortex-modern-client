import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * SetIgnoreRoomInvitesMessageComposer (header 1332)
 *
 * Whether room invites from other players should be dropped. Sent by the other-settings
 * checkbox, which writes the messenger's own copy of the flag first.
 *
 * Name recovered from the emulator's `SetIgnoreRoomInvitesMessageEvent = 1332`; the AS3 class
 * is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2091/_SafeCls_2539.as
 */
export class SetIgnoreRoomInvitesMessageComposer extends MessageComposer<[boolean]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2091/_SafeCls_2539.as::_SafeStr_4642
    private _data: [boolean];

    // AS3: .../_SafeCls_2539.as::_SafeCls_2539()
    constructor(ignored: boolean)
    {
        super();

        this._data = [ignored];
    }

    // AS3: .../_SafeCls_2539.as::getMessageArray()
    getMessageArray(): [boolean]
    {
        return this._data;
    }
}
