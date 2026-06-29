/**
 * Public interface for the Habbo Moderation component.
 *
 * @see source_as_win63/habbo/moderation/IHabboModeration.as
 */
export interface IHabboModeration
{
	/**
	 * Called when a user is selected in the UI for moderation.
	 *
	 * @param userId - The ID of the selected user
	 * @param userName - The name of the selected user
	 */
	userSelected(userId: number, userName: string): void;

	/**
	 * Whether the current user has moderator privileges.
	 */
	get isModerator(): boolean;
}
