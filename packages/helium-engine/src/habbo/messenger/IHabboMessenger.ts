/**
 * Interface for the Habbo messenger system.
 * Provides methods for managing conversations, online status,
 * and messenger UI state.
 *
 * @see source_as_win63/habbo/messenger/IHabboMessenger.as
 */
export interface IHabboMessenger
{
	/**
	 * Whether the user is following someone to a group room.
	 */
	followingToGroupRoom: boolean;

	/**
	 * Whether the messenger window is currently open.
	 */
	isOpen(): boolean;

	/**
	 * Toggles the messenger window open/closed.
	 */
	toggleMessenger(): void;

	/**
	 * Starts a conversation with the given user.
	 *
	 * @param userId - The user ID to start a conversation with
	 */
	startConversation(userId: number): void;

	/**
	 * Closes the conversation with the given user.
	 *
	 * @param userId - The user ID whose conversation to close
	 */
	closeConversation(userId: number): void;

	/**
	 * Sets whether following is allowed for a given user.
	 *
	 * @param userId - The user ID
	 * @param allowed - Whether following is allowed
	 */
	setFollowingAllowed(userId: number, allowed: boolean): void;

	/**
	 * Sets the online status for a given user in the messenger.
	 *
	 * @param userId - The user ID
	 * @param online - Whether the user is online
	 */
	setOnlineStatus(userId: number, online: boolean): void;

	/**
	 * Returns the count of unseen mini mail messages.
	 */
	getUnseenMiniMailMessageCount(): number;

	/**
	 * Returns whether room invites are being ignored.
	 */
	getRoomInvitesIgnored(): boolean;

	/**
	 * Sets whether room invites should be ignored.
	 *
	 * @param ignored - Whether to ignore room invites
	 */
	setRoomInvitesIgnored(ignored: boolean): void;
}
