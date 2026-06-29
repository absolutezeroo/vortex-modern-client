import type {IDisposable} from '@core/runtime';
import type {HabboQuestEngine} from './HabboQuestEngine';
import {AchievementCategories} from './AchievementCategories';
import type {AchievementData} from './AchievementCategory';
import {UnseenAchievementsCountUpdateEvent} from './events/UnseenAchievementsCountUpdateEvent';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('AchievementController');

/**
 * Achievement data controller
 *
 * Manages achievement data, categories, and unseen achievement tracking.
 * VIEW logic (window management, UI refresh) is handled by SolidJS.
 *
 * @see source_as_win63/habbo/quest/AchievementController.as
 */
export class AchievementController implements IDisposable
{
	private _engine: HabboQuestEngine | null;
	private _unseenAchievements: Map<number, AchievementData> = new Map();
	private _initialized: boolean = false;

	constructor(engine: HabboQuestEngine)
	{
		this._engine = engine;
	}

	private _categories: AchievementCategories | null = null;

	/**
	 * Get the achievement categories
	 */
	get categories(): AchievementCategories | null
	{
		return this._categories;
	}

	private _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	/**
	 * Handle achievement list received from server
	 *
	 * @param achievements Array of achievement data
	 * @param defaultCategory The default category to select
	 */
	onAchievements(achievements: AchievementData[], defaultCategory: string): void
	{
		if (this._categories === null)
		{
			this._categories = new AchievementCategories(achievements);
		}

		this._initialized = true;

		log.info(`Achievements loaded: ${achievements.length} achievements, default category: ${defaultCategory}`);
	}

	/**
	 * Handle a single achievement update from the server
	 *
	 * @param data The updated achievement data
	 */
	onAchievement(data: AchievementData): void
	{
		if (this._categories === null)
		{
			return;
		}

		// Track as unseen if not already tracking this achievement
		if (!(this._unseenAchievements.has(data.achievementId)))
		{
			this._unseenAchievements.set(data.achievementId, data);
			this.broadcastUnseenAchievementsCount();
		}

		this._categories.update(data);

		log.debug(`Achievement updated: ${data.achievementId}`);
	}

	/**
	 * Ensure achievements have been requested from the server.
	 * If not yet loaded, sends a request.
	 */
	ensureAchievementsInitialized(): void
	{
		if (this._categories === null && this._engine)
		{
			// The engine will send GetAchievementsComposer
			this._initialized = true;

			log.debug('Requesting achievements initialization');
		}
	}

	/**
	 * Get the user's achievement level for a given category and badge
	 *
	 * @param category The category code
	 * @param badge The badge identifier prefix
	 * @returns The user's level, or 0 if not found
	 */
	getAchievementLevel(category: string, badge: string): number
	{
		if (this._categories === null)
		{
			return 0;
		}

		const cat = this._categories.getCategoryByCode(category);

		if (cat === null)
		{
			return 0;
		}

		for (const achievement of cat.achievements)
		{
			if (achievement.badgeId.indexOf(badge) === 0)
			{
				return achievement.finalLevel ? achievement.level : Math.max(0, achievement.level - 1);
			}
		}

		return 0;
	}

	/**
	 * Broadcast the count of unseen achievements via event
	 */
	broadcastUnseenAchievementsCount(): void
	{
		if (!this._engine) return;

		const count = this._unseenAchievements.size;

		this._engine.events.emit(
			UnseenAchievementsCountUpdateEvent.TYPE,
			new UnseenAchievementsCountUpdateEvent(count)
		);

		log.debug(`Unseen achievements count: ${count}`);
	}

	/**
	 * Handle room exit - close achievement panel
	 */
	onRoomExit(): void
	{
		// In AS3 this calls close() which clears unseen achievements and hides window.
		// We just clear unseen tracking here; UI state is managed by SolidJS.
		this._unseenAchievements.clear();
		this.broadcastUnseenAchievementsCount();
	}

	/**
	 * Dispose of this controller and release resources
	 */
	dispose(): void
	{
		if (this._disposed) return;

		this._categories = null;
		this._unseenAchievements.clear();
		this._engine = null;
		this._disposed = true;
	}
}
