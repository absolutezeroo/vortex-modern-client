/**
 * Data class for guild (group) settings
 *
 * Tracks guild type and rights level with modification tracking.
 * Used in the guild management UI to detect unsaved changes.
 *
 * @see source_as_win63/habbo/groups/GuildSettingsData.as
 */
export class GuildSettingsData
{
	private _guildType: number = 0;

	get guildType(): number
	{
		return this._guildType;
	}

	set guildType(value: number)
	{
		if (value !== this._guildType)
		{
			this._isModified = true;
		}
		this._guildType = value;
	}

	private _rightsLevel: number = 0;

	get rightsLevel(): number
	{
		return this._rightsLevel;
	}

	set rightsLevel(value: number)
	{
		if (value !== this._rightsLevel)
		{
			this._isModified = true;
		}
		this._rightsLevel = value;
	}

	private _isModified: boolean = false;

	get isModified(): boolean
	{
		return this._isModified;
	}

	/**
	 * Reset the modification flag
	 */
	resetModified(): void
	{
		this._isModified = false;
	}
}
