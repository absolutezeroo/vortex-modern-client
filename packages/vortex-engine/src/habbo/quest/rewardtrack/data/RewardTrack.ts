/**
 * RewardTrack — one whole track: its tasks, its prizes, and the derived state the views read.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/data/RewardTrack.as
 *
 * The three mutators (`updateProgress`, `markPrizeClaimed`, `markPremiumPurchased`) all end in
 * `refreshDerivedState()`, which is the only place `complete` and `premiumComplete` are written —
 * the values the wire sent for them are overwritten at construction. Two consequences worth
 * knowing:
 *
 * - `complete` means every non-premium prize is claimed, not that every task is done;
 * - `premiumComplete` is **true whenever the track has no premium config at all**, so a free-only
 *   track reads as premium-complete rather than premium-incomplete.
 */
import type {RewardTrackData} from '@habbo/communication/messages/parser/quest/RewardTrackData';
import {RewardTrackTask} from './RewardTrackTask';
import {RewardTrackPrize} from './RewardTrackPrize';

export class RewardTrack
{
    // AS3: RewardTrack.as::_SafeStr_4872
    private _id: string;

    // AS3: RewardTrack.as::_theme
    private _theme: string;

    // AS3: RewardTrack.as::_SafeStr_6600
    private _points: number;

    // AS3: RewardTrack.as::_hasPremiumConfig
    private _hasPremiumConfig: boolean;

    // AS3: RewardTrack.as::_SafeStr_9545
    private _taskPointsBoost: number;

    // AS3: RewardTrack.as::_SafeStr_9613
    private _instantPoints: number;

    // AS3: RewardTrack.as::_SafeStr_9246
    private _costDiamonds: number;

    // AS3: RewardTrack.as::_SafeStr_8836
    private _costCredits: number;

    // AS3: RewardTrack.as::_SafeStr_7937
    private _premium: boolean;

    // AS3: RewardTrack.as::_SafeStr_4819
    private _complete: boolean;

    // AS3: RewardTrack.as::_SafeStr_8244
    private _premiumComplete: boolean;

    // AS3: RewardTrack.as::_SafeStr_5990
    private _tasks: RewardTrackTask[] = [];

    // AS3: RewardTrack.as::_prizes
    private _prizes: RewardTrackPrize[] = [];

    // AS3: RewardTrack.as::RewardTrack()
    constructor(data: RewardTrackData)
    {
        this._id = data.id;
        this._theme = data.theme;
        this._points = data.points;
        this._hasPremiumConfig = data.hasPremiumConfig;
        this._taskPointsBoost = data.taskPointsBoost;
        this._instantPoints = data.instantPoints;
        this._costDiamonds = data.costDiamonds;
        this._costCredits = data.costCredits;
        this._premium = data.premium;
        this._complete = data.complete;
        this._premiumComplete = data.premiumComplete;

        for(const task of data.tasks)
        {
            this._tasks.push(new RewardTrackTask(this, task));
        }

        for(const prize of data.prizes)
        {
            this._prizes.push(new RewardTrackPrize(prize));
        }

        this.refreshDerivedState();
    }

    // AS3: RewardTrack.as::updateProgress()
    public updateProgress(taskId: string, progressCount: number, points: number): RewardTrackTask | null
    {
        this._points = points;

        const task = this.getTaskById(taskId);

        if(task !== null)
        {
            task.progressCount = progressCount;
        }

        this.refreshDerivedState();

        return task;
    }

    // AS3: RewardTrack.as::markPrizeClaimed()
    public markPrizeClaimed(prizeId: string): RewardTrackPrize | null
    {
        const prize = this.getPrizeById(prizeId);

        if(prize !== null)
        {
            prize.claimed = true;
        }

        this.refreshDerivedState();

        return prize;
    }

    // AS3: RewardTrack.as::markPremiumPurchased()
    public markPremiumPurchased(points: number): void
    {
        this._premium = true;
        this._points = points;

        this.refreshDerivedState();
    }

    // AS3: RewardTrack.as::refreshDerivedState()
    public refreshDerivedState(): void
    {
        for(const prize of this._prizes)
        {
            prize.refreshAvailability(this);
        }

        let allFreeClaimed = true;
        let allPremiumClaimed = true;

        for(const prize of this._prizes)
        {
            if(!prize.premium && !prize.claimed)
            {
                allFreeClaimed = false;
            }

            if(prize.premium && !prize.claimed)
            {
                allPremiumClaimed = false;
            }
        }

        this._complete = allFreeClaimed;
        this._premiumComplete = !this._hasPremiumConfig || (allFreeClaimed && allPremiumClaimed);
    }

    // AS3: RewardTrack.as::getTaskById()
    public getTaskById(taskId: string): RewardTrackTask | null
    {
        for(const task of this._tasks)
        {
            if(task.id === taskId)
            {
                return task;
            }
        }

        return null;
    }

    // AS3: RewardTrack.as::getPrizeById()
    public getPrizeById(prizeId: string): RewardTrackPrize | null
    {
        for(const prize of this._prizes)
        {
            if(prize.id === prizeId)
            {
                return prize;
            }
        }

        return null;
    }

    // AS3: RewardTrack.as::get completedTaskCount()
    get completedTaskCount(): number
    {
        let count = 0;

        for(const task of this._tasks)
        {
            if(task.isComplete)
            {
                count += 1;
            }
        }

        return count;
    }

    // AS3: RewardTrack.as::get totalTaskCount()
    get totalTaskCount(): number
    {
        return this._tasks.length;
    }

    // AS3: RewardTrack.as::get claimedPrizeCount()
    get claimedPrizeCount(): number
    {
        let count = 0;

        for(const prize of this._prizes)
        {
            if(prize.claimed)
            {
                count += 1;
            }
        }

        return count;
    }

    // AS3: RewardTrack.as::get totalPrizeCount()
    get totalPrizeCount(): number
    {
        return this._prizes.length;
    }

    // AS3: RewardTrack.as::get hasPremiumPrizes()
    get hasPremiumPrizes(): boolean
    {
        for(const prize of this._prizes)
        {
            if(prize.premium)
            {
                return true;
            }
        }

        return false;
    }

    // AS3: RewardTrack.as::get hasPremiumTasks()
    get hasPremiumTasks(): boolean
    {
        for(const task of this._tasks)
        {
            if(task.premium)
            {
                return true;
            }
        }

        return false;
    }

    // AS3: RewardTrack.as::get hasPremiumLevels()
    get hasPremiumLevels(): boolean
    {
        for(const task of this._tasks)
        {
            if(task.hasPremiumLevels)
            {
                return true;
            }
        }

        return false;
    }

    // AS3: RewardTrack.as::get id()
    get id(): string
    {
        return this._id;
    }

    // AS3: RewardTrack.as::get theme()
    get theme(): string
    {
        return this._theme;
    }

    // AS3: RewardTrack.as::get points()
    get points(): number
    {
        return this._points;
    }

    // AS3: RewardTrack.as::get hasPremiumConfig()
    get hasPremiumConfig(): boolean
    {
        return this._hasPremiumConfig;
    }

    // AS3: RewardTrack.as::get taskPointsBoost()
    get taskPointsBoost(): number
    {
        return this._taskPointsBoost;
    }

    // AS3: RewardTrack.as::get instantPoints()
    get instantPoints(): number
    {
        return this._instantPoints;
    }

    // AS3: RewardTrack.as::get costDiamonds()
    get costDiamonds(): number
    {
        return this._costDiamonds;
    }

    // AS3: RewardTrack.as::get costCredits()
    get costCredits(): number
    {
        return this._costCredits;
    }

    // AS3: RewardTrack.as::get premium()
    get premium(): boolean
    {
        return this._premium;
    }

    // AS3: RewardTrack.as::get complete()
    get complete(): boolean
    {
        return this._complete;
    }

    // AS3: RewardTrack.as::get premiumComplete()
    get premiumComplete(): boolean
    {
        return this._premiumComplete;
    }

    // AS3: RewardTrack.as::get tasks()
    get tasks(): RewardTrackTask[]
    {
        return this._tasks;
    }

    // AS3: RewardTrack.as::get prizes()
    get prizes(): RewardTrackPrize[]
    {
        return this._prizes;
    }
}
