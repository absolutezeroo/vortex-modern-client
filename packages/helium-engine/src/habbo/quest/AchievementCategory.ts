import type {AchievementData} from '@habbo/communication/messages/parser/quest/AchievementData';

export type {AchievementData};

/**
 * Single achievement category containing achievements and progress calculations
 *
 * @see source_as_win63/habbo/quest/AchievementCategory.as
 */
export class AchievementCategory
{
    constructor(code: string)
    {
        this._code = code;
    }

    private _code: string;

    get code(): string
    {
        return this._code;
    }

    private _achievements: AchievementData[] = [];

    get achievements(): AchievementData[]
    {
        return this._achievements;
    }

    /**
	 * Add an achievement to this category
	 *
	 * @param data The achievement data to add
	 */
    add(data: AchievementData): void
    {
        this._achievements.push(data);
    }

    /**
	 * Update an existing achievement in this category
	 *
	 * @param data The updated achievement data
	 */
    update(data: AchievementData): void
    {
        for(let i = 0; i < this._achievements.length; i++)
        {
            if(this._achievements[i].achievementId === data.achievementId)
            {
                this._achievements[i] = data;
                return;
            }
        }
    }

    /**
	 * Calculate the current progress for this category.
	 * For each achievement: if finalLevel, count full level; otherwise count level - 1.
	 *
	 * @returns The total progress across all achievements
	 */
    getProgress(): number
    {
        let progress = 0;

        for(const achievement of this._achievements)
        {
            progress += achievement.finalLevel ? achievement.level : (achievement.level - 1);
        }

        return progress;
    }

    /**
	 * Calculate the maximum possible progress for this category.
	 * Sum of levelCount for each achievement.
	 *
	 * @returns The maximum progress across all achievements
	 */
    getMaxProgress(): number
    {
        let maxProgress = 0;

        for(const achievement of this._achievements)
        {
            maxProgress += achievement.levelCount;
        }

        return maxProgress;
    }
}
