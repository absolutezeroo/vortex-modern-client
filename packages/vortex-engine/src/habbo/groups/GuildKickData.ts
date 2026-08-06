/**
 * Data class for guild kick/block operations
 *
 * Holds the target user, guild, and whether the kick includes a block.
 * Used during the confirmation flow before kicking or blocking a member.
 *
 * @see source_as_win63/habbo/groups/GuildKickData.as
 */
export class GuildKickData
{
    constructor(guildId: number, targetId: number, isBlocked: boolean = false)
    {
        this._kickGuildId = guildId;
        this._kickTargetId = targetId;
        this._targetBlocked = isBlocked;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/groups/GuildKickData.as::_kickGuildId
    private _kickGuildId: number;

    // AS3: .../src/com/sulake/habbo/groups/GuildKickData.as::get kickGuildId()
    get kickGuildId(): number
    {
        return this._kickGuildId;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/groups/GuildKickData.as::_kickTargetId
    private _kickTargetId: number;

    // AS3: .../src/com/sulake/habbo/groups/GuildKickData.as::get kickTargetId()
    get kickTargetId(): number
    {
        return this._kickTargetId;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/groups/GuildKickData.as::_targetBlocked
    private _targetBlocked: boolean;

    // AS3: .../src/com/sulake/habbo/groups/GuildKickData.as::get targetBlocked()
    get targetBlocked(): boolean
    {
        return this._targetBlocked;
    }
}
