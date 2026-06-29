/**
 * Event dispatched when guild visual settings are changed in the management UI
 *
 * @see source_as_win63/habbo/groups/events/GuildSettingsChangedInManageEvent.as
 */
export class GuildSettingsChangedInManageEvent
{
	public static readonly GUILD_VISUAL_SETTINGS_CHANGED = 'GSCIME_GUILD_VISUAL_SETTINGS_CHANGED';

	constructor(guildId: number)
	{
		this._guildId = guildId;
	}

	private _guildId: number;

	get guildId(): number
	{
		return this._guildId;
	}
}
