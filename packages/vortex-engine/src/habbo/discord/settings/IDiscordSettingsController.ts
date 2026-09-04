import type {
    DiscordPreferences
} from '@habbo/communication/messages/parser/discord/DiscordPreferences';

/**
 * The two members `HabboDiscordManager` reaches its settings controller through.
 *
 * `_SafeCls_1921` in the primary tree; the name is **derived** from its sole implementor,
 * `DiscordSettingsController`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/discord/settings/_SafeCls_1921.as
 */
export interface IDiscordSettingsController
{
    // AS3: .../settings/_SafeCls_1921.as::get preferences()
    readonly preferences: DiscordPreferences;

    // AS3: .../settings/_SafeCls_1921.as::onDiscordConnected()
    onDiscordConnected(): void;
}
