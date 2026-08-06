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
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/GuildSettingsData.as::GuildSettingsData()
    // Seeds the initial values directly (not through the setters), so isModified stays
    // false. Without it the fields defaulted to 0/0 and any load through the setters
    // flagged the group-management window as modified the moment it opened.
    constructor(data?: {guildType: number; guildRightsLevel: number} | null)
    {
        if(!data) return;

        this._guildType = data.guildType;
        this._rightsLevel = data.guildRightsLevel;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/groups/GuildSettingsData.as::_guildType
    private _guildType: number = 0;

    // AS3: .../src/com/sulake/habbo/groups/GuildSettingsData.as::get guildType()
    get guildType(): number
    {
        return this._guildType;
    }

    // AS3: .../src/com/sulake/habbo/groups/GuildSettingsData.as::set guildType()
    set guildType(value: number)
    {
        if(value !== this._guildType)
        {
            this._isModified = true;
        }
        this._guildType = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/groups/GuildSettingsData.as::_rightsLevel
    private _rightsLevel: number = 0;

    // AS3: .../src/com/sulake/habbo/groups/GuildSettingsData.as::get rightsLevel()
    get rightsLevel(): number
    {
        return this._rightsLevel;
    }

    // AS3: .../src/com/sulake/habbo/groups/GuildSettingsData.as::set rightsLevel()
    set rightsLevel(value: number)
    {
        if(value !== this._rightsLevel)
        {
            this._isModified = true;
        }
        this._rightsLevel = value;
    }

    private _isModified: boolean = false;

    // AS3: .../src/com/sulake/habbo/groups/GuildSettingsData.as::get isModified()
    get isModified(): boolean
    {
        return this._isModified;
    }

    /**
	 * Reset the modification flag
	 */
    // AS3: .../src/com/sulake/habbo/groups/GuildSettingsData.as::resetModified()
    resetModified(): void
    {
        this._isModified = false;
    }
}
