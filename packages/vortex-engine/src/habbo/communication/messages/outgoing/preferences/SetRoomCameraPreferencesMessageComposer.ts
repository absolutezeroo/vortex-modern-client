import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * SetRoomCameraPreferencesMessageComposer (header 3917)
 *
 * Whether the room camera should stop following the player. Sent by the other-settings
 * checkbox, which is only shown when `room.camera.follow_user` is on.
 *
 * Name recovered from the emulator's `SetRoomCameraPreferencesMessageEvent = 3917`; the AS3 class
 * is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2091/_SafeCls_3911.as
 */
export class SetRoomCameraPreferencesMessageComposer extends MessageComposer<[boolean]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2091/_SafeCls_3911.as::_SafeStr_4642
    private _data: [boolean];

    // AS3: .../_SafeCls_3911.as::_SafeCls_3911()
    constructor(disabled: boolean)
    {
        super();

        this._data = [disabled];
    }

    // AS3: .../_SafeCls_3911.as::getMessageArray()
    getMessageArray(): [boolean]
    {
        return this._data;
    }
}
