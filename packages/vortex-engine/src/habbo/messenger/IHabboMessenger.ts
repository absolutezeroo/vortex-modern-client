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
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/messenger/IHabboMessenger.as::isOpen()
    isOpen(): boolean;

    /**
	 * Toggles the messenger window open/closed.
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/messenger/IHabboMessenger.as::toggleMessenger()
    toggleMessenger(): void;

    /**
	 * Starts a conversation with the given user.
	 *
	 * @param userId - The user ID to start a conversation with
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/messenger/IHabboMessenger.as::startConversation()
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
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/messenger/IHabboMessenger.as::getUnseenMiniMailMessageCount()
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
