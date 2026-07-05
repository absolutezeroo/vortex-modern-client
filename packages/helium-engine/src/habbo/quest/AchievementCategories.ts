import type {AchievementData} from './AchievementCategory';
import {AchievementCategory} from './AchievementCategory';

/**
 * Container class that organizes achievements into categories and calculates overall progress
 *
 * @see source_as_win63/habbo/quest/AchievementCategories.as
 */
export class AchievementCategories
{
    public static readonly ACHIEVEMENT_DISABLED: number = 0;
    public static readonly ACHIEVEMENT_ENABLED: number = 1;
    public static readonly ACHIEVEMENT_ARCHIVED: number = 2;
    public static readonly ACHIEVEMENT_OFF_SEASON: number = 3;
    public static readonly ACHIEVEMENT_CATEGORY_ARCHIVED: string = 'archive';

    private _categories: Map<string, AchievementCategory> = new Map();

    /**
	 * Construct achievement categories from an array of achievement data.
	 * Groups achievements into categories, with archived achievements placed
	 * in the special "archive" category and "misc" category placed last.
	 *
	 * @param achievements Array of achievement data to categorize
	 */
    constructor(achievements: AchievementData[])
    {
        const archiveCategory = new AchievementCategory(AchievementCategories.ACHIEVEMENT_CATEGORY_ARCHIVED);
        this._categories.set(AchievementCategories.ACHIEVEMENT_CATEGORY_ARCHIVED, archiveCategory);

        let miscCategory: AchievementCategory | null = null;

        for(const achievement of achievements)
        {
            if(achievement.category === '')
            {
                continue;
            }

            let category: AchievementCategory | undefined;

            if(achievement.state === AchievementCategories.ACHIEVEMENT_ARCHIVED)
            {
                category = this._categories.get(AchievementCategories.ACHIEVEMENT_CATEGORY_ARCHIVED);
            }
            else
            {
                category = this._categories.get(achievement.category);
            }

            if(!category)
            {
                category = new AchievementCategory(achievement.category);
                this._categories.set(achievement.category, category);

                if(achievement.category !== 'misc')
                {
                    this._categoryList.push(category);
                }
                else
                {
                    miscCategory = category;
                }
            }

            category.add(achievement);
        }

        // Push misc category at the end (before archive)
        if(miscCategory !== null)
        {
            this._categoryList.push(miscCategory);
        }

        // Push archive category at the very end
        this._categoryList.push(archiveCategory);
    }

    private _categoryList: AchievementCategory[] = [];

    /**
	 * Get the ordered list of categories
	 */
    get categoryList(): AchievementCategory[]
    {
        return this._categoryList;
    }

    /**
	 * Update an achievement in its appropriate category
	 *
	 * @param data The updated achievement data
	 */
    update(data: AchievementData): void
    {
        if(!data || data.category === '')
        {
            return;
        }

        const category = this._categories.get(data.category);

        if(category)
        {
            category.update(data);
        }
    }

    /**
	 * Find a category by its code
	 *
	 * @param code The category code to search for
	 * @returns The matching category, or null if not found
	 */
    getCategoryByCode(code: string): AchievementCategory | null
    {
        for(const category of this._categoryList)
        {
            if(category.code === code)
            {
                return category;
            }
        }

        return null;
    }

    /**
	 * Calculate the total current progress across all categories
	 *
	 * @returns The sum of progress from all categories
	 */
    getProgress(): number
    {
        let progress = 0;

        for(const category of this._categoryList)
        {
            progress += category.getProgress();
        }

        return progress;
    }

    /**
	 * Calculate the total maximum progress across all categories
	 *
	 * @returns The sum of max progress from all categories
	 */
    getMaxProgress(): number
    {
        let maxProgress = 0;

        for(const category of this._categoryList)
        {
            maxProgress += category.getMaxProgress();
        }

        return maxProgress;
    }
}
