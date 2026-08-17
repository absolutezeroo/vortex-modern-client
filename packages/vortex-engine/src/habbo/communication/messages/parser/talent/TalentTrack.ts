import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {MathUtils} from '@habbo/utils/MathUtils';
import {TalentTrackLevel} from './TalentTrackLevel';
import type {TalentTrackTask} from './TalentTrackTask';

/**
 * A whole talent track — citizenship or helper — as a list of levels.
 *
 * Name recovered from `sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/
 * communication/messages/parser/talent/TalentTrack.as`, which is unobfuscated.
 *
 * `parse()` records which level is the active one while reading (state `STATE_IN_PROGRESS`),
 * because every progress figure below is expressed relative to it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2740/_SafeCls_4409.as
 */
export class TalentTrack
{
    // AS3: _SafeCls_4409.as::STATE_LOCKED
    public static readonly STATE_LOCKED: number = 0;

    /** Derived name — `_SafeStr_10673`; the state `parse()` reads as "this is the current level". */
    // AS3: _SafeCls_4409.as::_SafeStr_10673
    public static readonly STATE_IN_PROGRESS: number = 1;

    /** Derived name — `_SafeStr_10869`. */
    // AS3: _SafeCls_4409.as::_SafeStr_10869
    public static readonly STATE_COMPLETED: number = 2;

    // AS3: _SafeCls_4409.as::_name
    private _name: string = '';

    /** Derived name — `_SafeStr_6285`: the index of the level currently in progress. */
    // AS3: _SafeCls_4409.as::_SafeStr_6285
    private _currentLevelIndex: number = 0;

    // AS3: _SafeCls_4409.as::_levels
    private _levels: TalentTrackLevel[] = [];

    // AS3: _SafeCls_4409.as::parse()
    public parse(wrapper: IMessageDataWrapper): void
    {
        this._name = wrapper.readString();
        this._levels = [];

        const count = wrapper.readInt();

        for(let index = 0; index < count; index++)
        {
            const level = new TalentTrackLevel();

            level.parse(wrapper);

            if(level.state === TalentTrack.STATE_IN_PROGRESS)
            {
                this._currentLevelIndex = index;
            }

            this._levels.push(level);
        }
    }

    /**
     * Searches every level that is not locked, and keeps the **last** match rather than the first —
     * an achievement appearing in two levels resolves to the later one.
     */
    // AS3: _SafeCls_4409.as::findTaskByAchievementId()
    public findTaskByAchievementId(achievementId: number): TalentTrackTask | null
    {
        let found: TalentTrackTask | null = null;

        for(const level of this._levels)
        {
            if(level.state !== TalentTrack.STATE_LOCKED)
            {
                const task = level.findTaskByAchievementId(achievementId);

                if(task !== null)
                {
                    found = task;
                }
            }
        }

        return found;
    }

    // AS3: _SafeCls_4409.as::get name()
    get name(): string
    {
        return this._name;
    }

    // AS3: _SafeCls_4409.as::get levels()
    get levels(): TalentTrackLevel[]
    {
        return this._levels;
    }

    // AS3: _SafeCls_4409.as::get progressPerLevel()
    get progressPerLevel(): number
    {
        if(this._levels.length > 0)
        {
            return 1 / this._levels.length;
        }

        return 0;
    }

    // AS3: _SafeCls_4409.as::get totalProgress()
    get totalProgress(): number
    {
        if(this._levels.length > 0)
        {
            const levelProgress = this._levels[this._currentLevelIndex].levelProgress;

            return MathUtils.clamp(
                this._currentLevelIndex * this.progressPerLevel + levelProgress * this.progressPerLevel
            );
        }

        return 0;
    }

    // AS3: _SafeCls_4409.as::get progressForCurrentLevel()
    get progressForCurrentLevel(): number
    {
        if(this._levels.length > 0)
        {
            return this._currentLevelIndex * this.progressPerLevel;
        }

        return 0;
    }

    /**
     * Drops level 0, which the citizenship track does once its first level is behind the user. The
     * current-level index follows it down and is floored at 0.
     */
    // AS3: _SafeCls_4409.as::removeFirstLevel()
    public removeFirstLevel(): void
    {
        this._levels.shift();
        this._currentLevelIndex = Math.max(0, this._currentLevelIndex - 1);
    }
}
