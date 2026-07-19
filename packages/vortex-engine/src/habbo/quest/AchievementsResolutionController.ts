import type {IDisposable} from '@core/runtime';
import type {HabboQuestEngine} from './HabboQuestEngine';
import type {AchievementData} from './AchievementCategory';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('AchievementsResolutionController');

/**
 * Achievement resolution controller
 *
 * Handles the achievement resolution flow where users select achievements
 * to work toward via furniture items (resolution achievements).
 * VIEW logic is handled by SolidJS.
 *
 * @see source_as_win63/habbo/quest/AchievementsResolutionController.as
 */
export class AchievementsResolutionController implements IDisposable
{
    private _engine: HabboQuestEngine | null;

    constructor(engine: HabboQuestEngine)
    {
        this._engine = engine;
    }

    private _stuffId: number = -1;

    /**
	 * Get the stuff ID associated with the current resolution
	 */
    get stuffId(): number
    {
        return this._stuffId;
    }

    private _selectedAchievementId: number = -1;

    /**
	 * Get the selected achievement ID
	 */
    get selectedAchievementId(): number
    {
        return this._selectedAchievementId;
    }

    private _endTime: number = -1;

    /**
	 * Get the end time for the current resolution
	 */
    get endTime(): number
    {
        return this._endTime;
    }

    private _achievements: unknown[] = [];

    /**
	 * Get the resolution achievements
	 */
    get achievements(): unknown[]
    {
        return this._achievements;
    }

    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
	 * Handle resolution achievements received from server
	 *
	 * @param stuffId The furniture item ID
	 * @param achievements The available resolution achievements
	 * @param endTime The end time for the resolution period
	 */
    onResolutionAchievements(stuffId: number, achievements: unknown[], endTime: number): void
    {
        this._stuffId = stuffId;
        this._achievements = achievements;
        this._endTime = endTime;

        if(achievements.length === 0)
        {
            return;
        }

        // Select first achievement by default
        const first = achievements[0] as Record<string, unknown>;
        this._selectedAchievementId = (first.achievementId as number) ?? -1;

        log.info(`Resolution achievements received: stuffId=${stuffId}, count=${achievements.length}, endTime=${endTime}`);
    }

    /**
	 * Handle resolution progress update
	 *
	 * @param stuffId The furniture item ID
	 * @param achievementId The achievement being tracked
	 * @param badgeCode The badge code for the required level
	 * @param userProgress The user's current progress
	 * @param totalProgress The total progress required
	 * @param endTime The end time for the resolution period
	 */
    onResolutionProgress(stuffId: number, achievementId: number, badgeCode: string, userProgress: number, totalProgress: number, _endTime: number): void
    {
        log.debug(`Resolution progress: stuffId=${stuffId}, achievementId=${achievementId}, badge=${badgeCode}, progress=${userProgress}/${totalProgress}`);
    }

    /**
	 * Handle resolution completed
	 *
	 * @param badgeCode The badge code earned
	 * @param stuffCode The stuff code of the item
	 */
    onResolutionCompleted(badgeCode: string, stuffCode: string): void
    {
        log.info(`Resolution completed: badge=${badgeCode}, stuff=${stuffCode}`);
    }

    /**
	 * Handle achievement level-up during resolution
	 *
	 * @param data The level-up notification data
	 */
    onLevelUp(_data: unknown): void
    {
        log.debug('Resolution level-up received');
    }

    /**
	 * Handle a single achievement update during resolution
	 *
	 * @param data The updated achievement data
	 */
    onAchievement(data: AchievementData): void
    {
        log.debug(`Resolution achievement update: ${data.achievementId}`);
    }

    /**
	 * Reset the resolution for a furniture item
	 *
	 * @param stuffId The furniture item ID to reset
	 */
    resetResolution(stuffId: number): void
    {
        log.debug(`Reset resolution: stuffId=${stuffId}`);
    }

    /**
	 * Dispose of this controller and release resources
	 */
    dispose(): void
    {
        if(this._disposed) return;

        this._achievements = [];
        this._engine = null;
        this._disposed = true;
    }
}
