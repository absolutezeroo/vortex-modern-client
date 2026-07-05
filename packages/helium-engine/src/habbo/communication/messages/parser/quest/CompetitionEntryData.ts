import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Represents a competition entry with user ranking and reward information.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/quest/class_1760.as
 */
export class CompetitionEntryData
{
    constructor(wrapper: IMessageDataWrapper)
    {
        this._communityGoalId = wrapper.readInt();
        this._communityGoalCode = wrapper.readString();
        this._userRank = wrapper.readInt();
        this._rewardCode = wrapper.readString();
        this._badge = wrapper.readBoolean();
        this._localizedName = wrapper.readString();
    }

    private _communityGoalId: number;

    get communityGoalId(): number
    {
        return this._communityGoalId;
    }

    private _communityGoalCode: string;

    get communityGoalCode(): string
    {
        return this._communityGoalCode;
    }

    private _userRank: number;

    get userRank(): number
    {
        return this._userRank;
    }

    private _rewardCode: string;

    get rewardCode(): string
    {
        return this._rewardCode;
    }

    private _badge: boolean;

    get badge(): boolean
    {
        return this._badge;
    }

    private _localizedName: string;

    get localizedName(): string
    {
        return this._localizedName;
    }
}
