import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Represents community goal progress data.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/quest/class_1678.as
 */
export class CommunityGoalProgressData
{
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

    get hasGoalExpired(): boolean
    {
        return this._hasGoalExpired;
    }

    private _personalContributionScore: number;

    get personalContributionScore(): number
    {
        return this._personalContributionScore;
    }

    private _personalContributionRank: number;

    get personalContributionRank(): number
    {
        return this._personalContributionRank;
    }

    private _communityTotalScore: number;

    get communityTotalScore(): number
    {
        return this._communityTotalScore;
    }

    private _communityHighestAchievedLevel: number;

    get communityHighestAchievedLevel(): number
    {
        return this._communityHighestAchievedLevel;
    }

    private _scoreRemainingUntilNextLevel: number;

    get scoreRemainingUntilNextLevel(): number
    {
        return this._scoreRemainingUntilNextLevel;
    }

    private _percentCompletionTowardsNextLevel: number;

    get percentCompletionTowardsNextLevel(): number
    {
        return this._percentCompletionTowardsNextLevel;
    }

    private _goalCode: string;

    get goalCode(): string
    {
        return this._goalCode;
    }

    private _timeRemainingInSeconds: number;

    get timeRemainingInSeconds(): number
    {
        return this._timeRemainingInSeconds;
    }

    private _rewardUserLimits: Array<number>;

    get rewardUserLimits(): Array<number>
    {
        return this._rewardUserLimits;
    }
}
