import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Represents community goal progress data.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1976/_SafeCls_4497.as
 */
export class CommunityGoalProgressData
{
    // AS3: .../src/unknowns/_SafePkg_1976/_SafeCls_4497.as::_SafeCls_4497()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._hasGoalExpired = wrapper.readBoolean();
        this._personalContributionScore = wrapper.readInt();
        this._personalContributionRank = wrapper.readInt();
        this._communityTotalScore = wrapper.readInt();
        this._communityHighestAchievedLevel = wrapper.readInt();
        this._scoreRemainingUntilNextLevel = wrapper.readInt();
        this._percentCompletionTowardsNextLevel = wrapper.readInt();
        this._goalCode = wrapper.readString();
        this._timeRemainingInSeconds = wrapper.readInt();

        const count = wrapper.readInt();
        this._rewardUserLimits = [];
        for(let i = 0; i < count; i++)
        {
            this._rewardUserLimits.push(wrapper.readInt());
        }
    }

    private _hasGoalExpired: boolean;

    // AS3: .../src/unknowns/_SafePkg_1976/_SafeCls_4497.as::get hasGoalExpired()
    get hasGoalExpired(): boolean
    {
        return this._hasGoalExpired;
    }

    private _personalContributionScore: number;

    // AS3: .../src/unknowns/_SafePkg_1976/_SafeCls_4497.as::get personalContributionScore()
    get personalContributionScore(): number
    {
        return this._personalContributionScore;
    }

    private _personalContributionRank: number;

    // AS3: .../src/unknowns/_SafePkg_1976/_SafeCls_4497.as::get personalContributionRank()
    get personalContributionRank(): number
    {
        return this._personalContributionRank;
    }

    private _communityTotalScore: number;

    // AS3: .../src/unknowns/_SafePkg_1976/_SafeCls_4497.as::get communityTotalScore()
    get communityTotalScore(): number
    {
        return this._communityTotalScore;
    }

    private _communityHighestAchievedLevel: number;

    // AS3: .../src/unknowns/_SafePkg_1976/_SafeCls_4497.as::get communityHighestAchievedLevel()
    get communityHighestAchievedLevel(): number
    {
        return this._communityHighestAchievedLevel;
    }

    private _scoreRemainingUntilNextLevel: number;

    // AS3: .../src/unknowns/_SafePkg_1976/_SafeCls_4497.as::get scoreRemainingUntilNextLevel()
    get scoreRemainingUntilNextLevel(): number
    {
        return this._scoreRemainingUntilNextLevel;
    }

    private _percentCompletionTowardsNextLevel: number;

    // AS3: .../src/unknowns/_SafePkg_1976/_SafeCls_4497.as::get percentCompletionTowardsNextLevel()
    get percentCompletionTowardsNextLevel(): number
    {
        return this._percentCompletionTowardsNextLevel;
    }

    private _goalCode: string;

    // AS3: .../src/unknowns/_SafePkg_1976/_SafeCls_4497.as::get goalCode()
    get goalCode(): string
    {
        return this._goalCode;
    }

    private _timeRemainingInSeconds: number;

    // AS3: .../src/unknowns/_SafePkg_1976/_SafeCls_4497.as::get timeRemainingInSeconds()
    get timeRemainingInSeconds(): number
    {
        return this._timeRemainingInSeconds;
    }

    private _rewardUserLimits: Array<number> | null;

    // AS3: .../src/unknowns/_SafePkg_1976/_SafeCls_4497.as::get rewardUserLimits()
    get rewardUserLimits(): Array<number>
    {
        return this._rewardUserLimits ?? [];
    }

    // AS3 reads `disposed` off the reward-limit array being null, which is what `dispose()` clears —
    // there is no separate flag.
    // AS3: .../src/unknowns/_SafePkg_1976/_SafeCls_4497.as::get disposed()
    get disposed(): boolean
    {
        return this._rewardUserLimits === null;
    }

    // AS3: .../src/unknowns/_SafePkg_1976/_SafeCls_4497.as::dispose()
    dispose(): void
    {
        this._rewardUserLimits = null;
    }
}
