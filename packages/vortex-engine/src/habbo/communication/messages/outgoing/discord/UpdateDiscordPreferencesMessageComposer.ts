import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Stores the four Discord toggles, header 2304
 * (`_composers[2304] = _SafeCls_3638` in WIN63's registry).
 *
 * The leading `version` is the hotel's own `discord_activity.settings.version`, not a count of
 * edits: writing it back is what marks the player as having answered the dialog, so the
 * five-second popup stops appearing on login.
 *
 * Sent by `DiscordSettingsController.updatePreferences()` when the settings window is closed.
 *
 * **Name derived** — the class is `_SafeCls_3638` and no tree carries a readable name for the
 * Discord package.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2989/_SafeCls_3638.as
 */
export class UpdateDiscordPreferencesMessageComposer extends MessageComposer<
    [number, boolean, boolean, boolean, boolean]
>
{
    // AS3: .../_SafePkg_2989/_SafeCls_3638.as::_SafeStr_4642
    private _data: [number, boolean, boolean, boolean, boolean];

    // AS3: .../_SafePkg_2989/_SafeCls_3638.as::_SafeCls_3638()
    constructor(
        version: number,
        showHabbo: boolean,
        shareActivity: boolean,
        hideInHiddenRooms: boolean,
        allowJoining: boolean
    )
    {
        super();

        this._data = [version, showHabbo, shareActivity, hideInHiddenRooms, allowJoining];
    }

    // AS3: .../_SafePkg_2989/_SafeCls_3638.as::getMessageArray()
    getMessageArray(): [number, boolean, boolean, boolean, boolean]
    {
        return this._data;
    }
}
