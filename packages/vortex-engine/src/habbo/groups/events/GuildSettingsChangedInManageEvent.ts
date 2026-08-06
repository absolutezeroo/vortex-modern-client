/**
 * Event dispatched when guild visual settings are changed in the management UI
 *
 * @see source_as_win63/habbo/groups/events/GuildSettingsChangedInManageEvent.as
 */
export class GuildSettingsChangedInManageEvent
{
    // AS3: .../src/com/sulake/habbo/groups/events/GuildSettingsChangedInManageEvent.as::GUILD_VISUAL_SETTINGS_CHANGED
    public static readonly GUILD_VISUAL_SETTINGS_CHANGED = 'GSCIME_GUILD_VISUAL_SETTINGS_CHANGED';

    constructor(guildId: number)
    {
        this._guildId = guildId;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/groups/events/GuildSettingsChangedInManageEvent.as::_guildId
    private _guildId: number;

    // AS3: .../src/com/sulake/habbo/groups/events/GuildSettingsChangedInManageEvent.as::get guildId()
    get guildId(): number
    {
        return this._guildId;
    }
}
