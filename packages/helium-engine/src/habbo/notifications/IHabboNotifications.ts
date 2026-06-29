/**
 * Interface for the Habbo notifications component.
 * Provides methods to add notification items, show notifications,
 * and handle song playing notifications.
 *
 * @see source_as_win63/habbo/notifications/IHabboNotifications.as
 */
export interface IHabboNotifications
{
	/**
	 * Add a notification item with content, type, and optional icon asset name
	 *
	 * @param content The notification message text
	 * @param type The notification type string (e.g., "info", "achievement")
	 * @param iconAssetName Optional asset name for the notification icon
	 */
	addItem(content: string, type: string, iconAssetName?: string | null): void;

	/**
	 * Show a notification with the given type and optional parameters
	 *
	 * @param type The notification type key
	 * @param parameters Optional parameters map for the notification
	 */
	showNotification(type: string, parameters?: Map<string, string> | null): void;

	/**
	 * Add a notification for a currently playing song
	 *
	 * @param songName The name of the song
	 * @param songAuthor The author of the song
	 */
	addSongPlayingNotification(songName: string, songAuthor: string): void;

	/**
	 * Dispose of the notifications component
	 */
	dispose(): void;
}
