/**
 * Builder Club utility functions.
 *
 * Provides static methods to identify Builder Club items
 * based on their ID threshold.
 *
 * @see source_as_win63/habbo/utils/class_3521.as
 */
export class BuilderClubUtils
{
	public static readonly BUILDER_CLUB_ID_THRESHOLD: number = 0x7FFF0000;

	/**
	 * Check if an ID belongs to a Builder Club item.
	 *
	 * @param id The item ID to check
	 * @returns True if the ID is at or above the Builder Club threshold
	 */
	static isBuilderClubId(id: number): boolean
	{
		return id >= BuilderClubUtils.BUILDER_CLUB_ID_THRESHOLD;
	}
}
