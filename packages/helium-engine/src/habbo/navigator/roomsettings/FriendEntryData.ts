/**
 * Simple data class holding a friend's user ID and name.
 * Used by RoomSettingsFriendListManager for room settings friend list display.
 *
 * @see source_as_win63/habbo/navigator/roomsettings/FriendEntryData.as
 */
export class FriendEntryData
{
	constructor(userId: number, userName: string)
	{
		this._userId = userId;
		this._userName = userName;
	}

	private _userId: number;

	get userId(): number
	{
		return this._userId;
	}

	private _userName: string;

	get userName(): string
	{
		return this._userName;
	}
}
