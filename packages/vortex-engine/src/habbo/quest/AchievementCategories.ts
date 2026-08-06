import type {AchievementData} from './AchievementCategory';
import {AchievementCategory} from './AchievementCategory';

/**
 * Container class that organizes achievements into categories and calculates overall progress
 *
 * @see source_as_win63/habbo/quest/AchievementCategories.as
 */
export class AchievementCategories
{
    // AS3: .../src/com/sulake/habbo/quest/AchievementCategories.as::ACHIEVEMENT_DISABLED
    public static readonly ACHIEVEMENT_DISABLED: number = 0;
    // AS3: .../src/com/sulake/habbo/quest/AchievementCategories.as::ACHIEVEMENT_ENABLED
    public static readonly ACHIEVEMENT_ENABLED: number = 1;
    // AS3: .../src/com/sulake/habbo/quest/AchievementCategories.as::ACHIEVEMENT_ARCHIVED
    public static readonly ACHIEVEMENT_ARCHIVED: number = 2;
    // AS3: .../src/com/sulake/habbo/quest/AchievementCategories.as::ACHIEVEMENT_OFF_SEASON
    public static readonly ACHIEVEMENT_OFF_SEASON: number = 3;
    // AS3: .../src/com/sulake/habbo/quest/AchievementCategories.as::ACHIEVEMENT_CATEGORY_ARCHIVED
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

            let category: AchievementCategory | null;

            if(achievement.state === AchievementCategories.ACHIEVEMENT_ARCHIVED)
            {
                category = this._categories.get(AchievementCategories.ACHIEVEMENT_CATEGORY_ARCHIVED) ?? null;
            }
            else
            {
                category = this._categories.get(achievement.category) ?? null;
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

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/quest/AchievementCategories.as::_categoryList
    private _categoryList: AchievementCategory[] = [];

    /**
	 * Get the ordered list of categories
	 */
    // AS3: .../src/com/sulake/habbo/quest/AchievementCategories.as::get categoryList()
    get categoryList(): AchievementCategory[]
    {
        return this._categoryList;
    }

    /**
	 * Update an achievement in its appropriate category
	 *
	 * @param data The updated achievement data
	 */
    // AS3: .../src/com/sulake/habbo/quest/AchievementCategories.as::update()
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
    // AS3: .../src/com/sulake/habbo/quest/AchievementCategories.as::getCategoryByCode()
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
    // AS3: .../src/com/sulake/habbo/quest/AchievementCategories.as::getProgress()
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
    // AS3: .../src/com/sulake/habbo/quest/AchievementCategories.as::getMaxProgress()
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
