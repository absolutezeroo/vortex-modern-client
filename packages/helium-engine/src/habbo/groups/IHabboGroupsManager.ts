/**
 * Interface for the Habbo Groups Manager
 *
 * Provides group-related operations including viewing group info,
 * badge info, and extended profiles.
 *
 * @see source_as_win63/habbo/groups/class_1880.as
 */
export interface IHabboGroupsManager
{
	/**
	 * Show group badge info and open group details
	 *
	 * @param isStaff Whether the requesting user is staff
	 * @param groupId The group ID to show badge info for
	 */
	showGroupBadgeInfo(isStaff: boolean, groupId: number): void;

	/**
	 * Open the group info panel for the given group
	 *
	 * @param groupId The group ID to open info for
	 */
	openGroupInfo(groupId: number): void;

	/**
	 * Update a currently visible extended profile
	 *
	 * @param userId The user ID whose profile should be updated
	 */
	updateVisibleExtendedProfile(userId: number): void;

	/**
	 * Show the extended profile for a user
	 *
	 * @param userId The user ID whose profile to show
	 */
	showExtendedProfile(userId: number): void;
}
