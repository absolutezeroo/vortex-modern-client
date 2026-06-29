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

	private _kickGuildId: number;

	get kickGuildId(): number
	{
		return this._kickGuildId;
	}

	private _kickTargetId: number;

	get kickTargetId(): number
	{
		return this._kickTargetId;
	}

	private _targetBlocked: boolean;

	get targetBlocked(): boolean
	{
		return this._targetBlocked;
	}
}
