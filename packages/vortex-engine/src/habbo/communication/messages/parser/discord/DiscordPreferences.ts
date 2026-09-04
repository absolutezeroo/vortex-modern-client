import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * The five fields the server stores for a player's Discord Rich Presence, read straight off the
 * wire by `readFromData()`.
 *
 * `version` is the only one that is not a toggle: `DiscordSettingsController` compares it against
 * the hotel's `discord_activity.settings.version` to decide whether the player has ever answered
 * the settings dialog, and a `0` means "never" — which is why the controller substitutes a
 * fully-enabled default rather than showing four unchecked boxes.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1917/DiscordPreferences.as
 */
export class DiscordPreferences
{
    // AS3: .../_SafePkg_1917/DiscordPreferences.as::_SafeStr_9087
    private readonly _version: number;

    // AS3: .../_SafePkg_1917/DiscordPreferences.as::_SafeStr_9467
    private readonly _showHabbo: boolean;

    // AS3: .../_SafePkg_1917/DiscordPreferences.as::_SafeStr_10118
    private readonly _shareActivity: boolean;

    // AS3: .../_SafePkg_1917/DiscordPreferences.as::_SafeStr_9828
    private readonly _hideInHiddenRooms: boolean;

    // AS3: .../_SafePkg_1917/DiscordPreferences.as::_SafeStr_9430
    private readonly _allowJoining: boolean;

    // AS3: .../_SafePkg_1917/DiscordPreferences.as::DiscordPreferences()
    constructor(
        version: number,
        showHabbo: boolean,
        shareActivity: boolean,
        hideInHiddenRooms: boolean,
        allowJoining: boolean
    )
    {
        this._version = version;
        this._showHabbo = showHabbo;
        this._shareActivity = shareActivity;
        this._hideInHiddenRooms = hideInHiddenRooms;
        this._allowJoining = allowJoining;
    }

    // AS3: .../_SafePkg_1917/DiscordPreferences.as::readFromData()
    static readFromData(wrapper: IMessageDataWrapper): DiscordPreferences
    {
        const version = wrapper.readInt();
        const showHabbo = wrapper.readBoolean();
        const shareActivity = wrapper.readBoolean();
        const hideInHiddenRooms = wrapper.readBoolean();
        const allowJoining = wrapper.readBoolean();

        return new DiscordPreferences(version, showHabbo, shareActivity, hideInHiddenRooms, allowJoining);
    }

    // AS3: .../_SafePkg_1917/DiscordPreferences.as::get version()
    get version(): number
    {
        return this._version;
    }

    // AS3: .../_SafePkg_1917/DiscordPreferences.as::get showHabbo()
    get showHabbo(): boolean
    {
        return this._showHabbo;
    }

    // AS3: .../_SafePkg_1917/DiscordPreferences.as::get shareActivity()
    get shareActivity(): boolean
    {
        return this._shareActivity;
    }

    // AS3: .../_SafePkg_1917/DiscordPreferences.as::get hideInHiddenRooms()
    get hideInHiddenRooms(): boolean
    {
        return this._hideInHiddenRooms;
    }

    // AS3: .../_SafePkg_1917/DiscordPreferences.as::get allowJoining()
    get allowJoining(): boolean
    {
        return this._allowJoining;
    }
}
