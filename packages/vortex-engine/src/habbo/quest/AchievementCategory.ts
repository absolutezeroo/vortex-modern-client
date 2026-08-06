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

    // AS3: .../src/com/sulake/habbo/quest/AchievementCategory.as::_code
    private _code: string;

    // AS3: .../src/com/sulake/habbo/quest/AchievementCategory.as::get code()
    get code(): string
    {
        return this._code;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/quest/AchievementCategory.as::_achievements
    private _achievements: AchievementData[] = [];

    // AS3: .../src/com/sulake/habbo/quest/AchievementCategory.as::get achievements()
    get achievements(): AchievementData[]
    {
        return this._achievements;
    }

    /**
	 * Add an achievement to this category
	 *
	 * @param data The achievement data to add
	 */
    // AS3: .../src/com/sulake/habbo/quest/AchievementCategory.as::add()
    add(data: AchievementData): void
    {
        this._achievements.push(data);
    }

    /**
	 * Update an existing achievement in this category
	 *
	 * @param data The updated achievement data
	 */
    // AS3: .../src/com/sulake/habbo/quest/AchievementCategory.as::update()
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
    // AS3: .../src/com/sulake/habbo/quest/AchievementCategory.as::getProgress()
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
    // AS3: .../src/com/sulake/habbo/quest/AchievementCategory.as::getMaxProgress()
    getMaxProgress(): number
    {
        let maxProgress = 0;

        for(const achievement of this._achievements)
        {
            maxProgress += achievement.levelCount;
        }

        return maxProgress;
    }

    /**
	 * Whether this category should appear in the categories grid.
	 * The "new" and "wired_games" categories are picked via other UI paths.
	 */
    // AS3: AchievementCategory.as::visibleInList()
    visibleInList(): boolean
    {
        return this._code !== 'new' && this._code !== 'wired_games';
    }
}
