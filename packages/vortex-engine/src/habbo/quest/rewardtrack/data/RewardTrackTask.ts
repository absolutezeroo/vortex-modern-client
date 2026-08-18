/**
 * RewardTrackTask — one task on a track, and where its progress sits among its rungs.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/data/RewardTrackTask.as
 *
 * `activeLevelIndex` returns the first rung the count has NOT reached; once every rung is cleared
 * it returns the last index rather than one past the end, so `activeLevel` is always addressable.
 */
import type {RewardTrackTaskData} from '@habbo/communication/messages/parser/quest/RewardTrackTaskData';
import {RewardTrackTaskLevel} from './RewardTrackTaskLevel';
import type {RewardTrack} from './RewardTrack';

export class RewardTrackTask
{
    // AS3: RewardTrackTask.as::_SafeStr_4821
    private _track: RewardTrack;

    // AS3: RewardTrackTask.as::_SafeStr_4872
    private _id: string;

    // AS3: RewardTrackTask.as::_SafeStr_7459
    private _actionType: string;

    // AS3: RewardTrackTask.as::_SafeStr_6705
    private _parameter: string;

    // AS3: RewardTrackTask.as::_SafeStr_6082
    private _progressCount: number;

    // AS3: RewardTrackTask.as::_SafeStr_7937
    private _premium: boolean;

    // AS3: RewardTrackTask.as::_levels
    private _levels: RewardTrackTaskLevel[] = [];

    // AS3: RewardTrackTask.as::RewardTrackTask()
    constructor(track: RewardTrack, data: RewardTrackTaskData)
    {
        this._track = track;
        this._id = data.id;
        this._actionType = data.actionType;
        this._parameter = data.parameter;
        this._progressCount = data.progressCount;
        this._premium = data.premium;

        for(const reward of data.taskRewards)
        {
            this._levels.push(new RewardTrackTaskLevel(reward));
        }
    }

    // AS3: RewardTrackTask.as::get isComplete()
    get isComplete(): boolean
    {
        for(const level of this._levels)
        {
            if(this._progressCount < level.requiredCount)
            {
                return false;
            }
        }

        return true;
    }

    // AS3: RewardTrackTask.as::get hasProgress()
    get hasProgress(): boolean
    {
        return this._progressCount > 0;
    }

    // AS3: RewardTrackTask.as::get activeLevelIndex()
    get activeLevelIndex(): number
    {
        for(let index = 0; index < this._levels.length; index++)
        {
            if(this._progressCount < this._levels[index].requiredCount)
            {
                return index;
            }
        }

        return this._levels.length - 1;
    }

    // AS3: RewardTrackTask.as::get activeLevel()
    get activeLevel(): RewardTrackTaskLevel
    {
        return this._levels[this.activeLevelIndex];
    }

    /** A rung requiring nothing is already full — AS3 short-circuits to 1 rather than dividing. */
    // AS3: RewardTrackTask.as::progressRatioFor()
    public progressRatioFor(level: RewardTrackTaskLevel): number
    {
        if(level.requiredCount <= 0)
        {
            return 1;
        }

        return Math.max(0, Math.min(1, this._progressCount / level.requiredCount));
    }

    // AS3: RewardTrackTask.as::get hasPremiumLevels()
    get hasPremiumLevels(): boolean
    {
        for(const level of this._levels)
        {
            if(level.premium)
            {
                return true;
            }
        }

        return false;
    }

    // AS3: RewardTrackTask.as::get track()
    get track(): RewardTrack
    {
        return this._track;
    }

    // AS3: RewardTrackTask.as::get id()
    get id(): string
    {
        return this._id;
    }

    // AS3: RewardTrackTask.as::get actionType()
    get actionType(): string
    {
        return this._actionType;
    }

    // AS3: RewardTrackTask.as::get parameter()
    get parameter(): string
    {
        return this._parameter;
    }

    // AS3: RewardTrackTask.as::get progressCount()
    get progressCount(): number
    {
        return this._progressCount;
    }

    // AS3: RewardTrackTask.as::set progressCount()
    set progressCount(value: number)
    {
        this._progressCount = value;
    }

    // AS3: RewardTrackTask.as::get premium()
    get premium(): boolean
    {
        return this._premium;
    }

    // AS3: RewardTrackTask.as::get levels()
    get levels(): RewardTrackTaskLevel[]
    {
        return this._levels;
    }
}
