/**
 * Utility functions for room entry display in the navigator.
 *
 * @see source_as_win63/habbo/navigator/view/search/results/RoomEntryUtils.as
 */
export class RoomEntryUtils
{
	/**
	 * Get the asset name for a door mode icon.
	 *
	 * @param doorMode The door mode value (0 = open, 1 = doorbell, 2 = password, 3 = invisible)
	 */
	static getDoorModeIconAsset(doorMode: number): string
	{
		switch (doorMode - 1)
		{
			case 0:
				return 'newnavigator_doormode_doorbell_small';
			case 1:
				return 'newnavigator_doormode_password_small';
			case 2:
				return 'newnavigator_doormode_invisible_small';
			default:
				return '';
		}
	}

	/**
	 * Modulate a background color with a group color using channel multiplication.
	 *
	 * @param groupColor The group color (-1 means no modulation)
	 * @param baseColor The base background color
	 */
	static getModulatedBackgroundColor(groupColor: number, baseColor: number): number
	{
		if (groupColor === -1)
		{
			return baseColor;
		}

		const baseR = ((baseColor & 0xFF0000) >>> 16) / 255;
		const baseG = ((baseColor & 0x00FF00) >>> 8) / 255;
		const baseB = (baseColor & 0x0000FF) / 255;

		const groupR = ((groupColor & 0xFF0000) >>> 16) / 255;
		const groupG = ((groupColor & 0x00FF00) >>> 8) / 255;
		const groupB = (groupColor & 0x0000FF) / 255;

		const r = baseR * Math.min(1, groupR * 1.5);
		const g = baseG * Math.min(1, groupG * 1.5);
		const b = baseB * Math.min(1, groupB * 1.5);

		return (((r * 255) << 16) + ((g * 255) << 8) + (b * 255) + 0xFF000000) >>> 0;
	}

	/**
	 * Get the asset name for the favorite icon.
	 *
	 * @param isFavorite Whether the room is favorited
	 */
	static getFavoriteIcon(isFavorite: boolean): string
	{
		return 'newnavigator_icon_fav_' + (isFavorite ? 'yes' : 'no');
	}
}
