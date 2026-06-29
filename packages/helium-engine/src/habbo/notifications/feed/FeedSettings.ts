/**
 * Feed category filtering with constants.
 * Manages which feed categories are visible to the user.
 *
 * @see source_as_win63/habbo/notifications/feed/FeedSettings.as
 */
export class FeedSettings
{
	public static readonly FEED_TYPE_NOTIFICATIONS: number = 0;
	public static readonly FEED_TYPE_STREAM: number = 1;
	public static readonly FEED_TYPE_STATUS: number = 2;
	public static readonly FEED_TYPE_MOTD: number = 3;

	public static readonly FEED_CATEGORY_ME: number = 0;
	public static readonly FEED_CATEGORY_FRIENDS: number = 1;
	public static readonly FEED_CATEGORY_HOTEL: number = 2;

	private _visibleCategories: number[];

	constructor()
	{
		this._visibleCategories = [];
		this._visibleCategories.push(1);
		this._visibleCategories.push(0);
		this._visibleCategories.push(2);
	}

	/**
	 * Get the list of currently visible feed categories
	 */
	getVisibleFeedCategories(): number[]
	{
		return this._visibleCategories;
	}

	/**
	 * Toggle visibility of a specific feed category
	 * @param category The category ID to toggle
	 */
	toggleVisibleFeedCategory(_category: number): void
	{
		// TODO: Requires NotificationController.updateFeedCategoryFiltering()
	}

	dispose(): void
	{
		this._visibleCategories = [];
	}
}
