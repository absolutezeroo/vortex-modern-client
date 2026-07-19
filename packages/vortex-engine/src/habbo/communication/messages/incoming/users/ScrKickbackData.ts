import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * ScrKickbackData
 *
 * Based on AS3:
 * - com.sulake.habbo.communication.messages.incoming.users.class_1739
 * - com.sulake.habbo.communication.messages.incoming.users.ScrKickbackData
 */
export class ScrKickbackData
{
    private _currentHcStreak: number;
    private _firstSubscriptionDate: string;
    private _kickbackPercentage: number;
    private _totalCreditsMissed: number;
    private _totalCreditsRewarded: number;
    private _totalCreditsSpent: number;
    private _creditRewardForStreakBonus: number;
    private _creditRewardForMonthlySpent: number;
    private _timeUntilPayday: number;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._currentHcStreak = wrapper.readInt();
        this._firstSubscriptionDate = wrapper.readString();
        this._kickbackPercentage = wrapper.readDouble();
        this._totalCreditsMissed = wrapper.readInt();
        this._totalCreditsRewarded = wrapper.readInt();
        this._totalCreditsSpent = wrapper.readInt();
        this._creditRewardForStreakBonus = wrapper.readInt();
        this._creditRewardForMonthlySpent = wrapper.readInt();
        this._timeUntilPayday = wrapper.readInt();
    }

    get currentHcStreak(): number
    {
        return this._currentHcStreak;
    }

    get firstSubscriptionDate(): string
    {
        return this._firstSubscriptionDate;
    }

    get kickbackPercentage(): number
    {
        return this._kickbackPercentage;
    }

    get totalCreditsMissed(): number
    {
        return this._totalCreditsMissed;
    }

    get totalCreditsRewarded(): number
    {
        return this._totalCreditsRewarded;
    }

    get totalCreditsSpent(): number
    {
        return this._totalCreditsSpent;
    }

    get creditRewardForStreakBonus(): number
    {
        return this._creditRewardForStreakBonus;
    }

    get creditRewardForMonthlySpent(): number
    {
        return this._creditRewardForMonthlySpent;
    }

    get timeUntilPayday(): number
    {
        return this._timeUntilPayday;
    }
}
