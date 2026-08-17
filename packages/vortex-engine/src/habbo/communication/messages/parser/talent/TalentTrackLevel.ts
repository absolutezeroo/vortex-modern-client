import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {MathUtils} from '@habbo/utils/MathUtils';
import {TalentTrackTask} from './TalentTrackTask';
import {TalentTrackRewardPerk} from './TalentTrackRewardPerk';
import {TalentTrackRewardProduct} from './TalentTrackRewardProduct';

/**
 * One level of a talent track: its tasks, and what completing them pays out.
 *
 * Name recovered from `sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/
 * communication/messages/parser/talent/TalentTrackLevel.as`, which is unobfuscated.
 *
 * `level` and `state` carry public setters in AS3 even though the parser only ever writes them
 * once — `TalentLevelUpController` rewrites them when a level-up arrives out of band.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2740/_SafeCls_2739.as
 */
export class TalentTrackLevel
{
    // AS3: _SafeCls_2739.as::_SafeStr_6012
    private _level: number = 0;

    // AS3: _SafeCls_2739.as::_SafeStr_4597
    private _state: number = 0;

    // AS3: _SafeCls_2739.as::_SafeStr_5990
    private _tasks: TalentTrackTask[] = [];

    // AS3: _SafeCls_2739.as::_SafeStr_7153
    private _rewardPerks: TalentTrackRewardPerk[] = [];

    // AS3: _SafeCls_2739.as::_SafeStr_7269
    private _rewardProducts: TalentTrackRewardProduct[] = [];

    // AS3: _SafeCls_2739.as::parse()
    public parse(wrapper: IMessageDataWrapper): void
    {
        this._level = wrapper.readInt();
        this._state = wrapper.readInt();

        let count = wrapper.readInt();

        for(let index = 0; index < count; index++)
        {
            this._tasks.push(new TalentTrackTask(wrapper));
        }

        count = wrapper.readInt();

        for(let index = 0; index < count; index++)
        {
            this._rewardPerks.push(new TalentTrackRewardPerk(wrapper));
        }

        count = wrapper.readInt();

        for(let index = 0; index < count; index++)
        {
            this._rewardProducts.push(new TalentTrackRewardProduct(wrapper));
        }
    }

    // AS3: _SafeCls_2739.as::get level()
    get level(): number
    {
        return this._level;
    }

    // AS3: _SafeCls_2739.as::set level()
    set level(value: number)
    {
        this._level = value;
    }

    // AS3: _SafeCls_2739.as::get state()
    get state(): number
    {
        return this._state;
    }

    // AS3: _SafeCls_2739.as::set state()
    set state(value: number)
    {
        this._state = value;
    }

    // AS3: _SafeCls_2739.as::get tasks()
    get tasks(): TalentTrackTask[]
    {
        return this._tasks;
    }

    // AS3: _SafeCls_2739.as::get rewardPerks()
    get rewardPerks(): TalentTrackRewardPerk[]
    {
        return this._rewardPerks;
    }

    // AS3: _SafeCls_2739.as::get rewardProducts()
    get rewardProducts(): TalentTrackRewardProduct[]
    {
        return this._rewardProducts;
    }

    // AS3: _SafeCls_2739.as::get rewardCount()
    get rewardCount(): number
    {
        return this._rewardPerks.length + this._rewardProducts.length;
    }

    /**
     * The share of this level's tasks that are complete (state 2), clamped to 0..1.
     */
    // AS3: _SafeCls_2739.as::get levelProgress()
    get levelProgress(): number
    {
        const perTask = 1 / this._tasks.length;
        let progress = 0;

        for(const task of this._tasks)
        {
            if(task.state === 2)
            {
                progress += perTask;
            }
        }

        return MathUtils.clamp(progress);
    }

    // AS3: _SafeCls_2739.as::findTaskByAchievementId()
    public findTaskByAchievementId(achievementId: number): TalentTrackTask | null
    {
        for(const task of this._tasks)
        {
            if(task.achievementId === achievementId)
            {
                return task;
            }
        }

        return null;
    }
}
