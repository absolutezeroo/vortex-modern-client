import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks the server for the account's stored volume settings (header 541). No payload.
 *
 * Sent once by `HabboSoundManagerFlash10.init()`. The answer does not come back on a
 * dedicated message — the volumes ride on `AccountPreferences` (724), which is what the
 * manager subscribes to.
 *
 * The class name is **derived**, not recovered: the composer is `_SafePkg_1902/_SafeCls_1901`
 * in every tree. It matches `vortex-emulator`'s `GetSoundSettingsEvent`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1902/_SafeCls_1901.as
 */
export class GetSoundSettingsComposer extends MessageComposer<[]>
{
    // AS3: .../_SafePkg_1902/_SafeCls_1901.as::_SafeCls_1901()
    constructor()
    {
        super();

        this._data = [];
    }

    // AS3: .../_SafePkg_1902/_SafeCls_1901.as::_SafeStr_4642
    private _data: [];

    // AS3: .../_SafePkg_1902/_SafeCls_1901.as::getMessageArray()
    getMessageArray(): []
    {
        return this._data;
    }
}
