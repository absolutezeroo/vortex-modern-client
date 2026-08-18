import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One prize on a reward track — what it costs in points and whether it is claimable yet.
 *
 * **The name is DERIVED**; see `RewardTrackTaskReward` for why.
 *
 * `productItemTypeId` is a **short**, not an int — the one narrow read in this message family.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2623/_SafeCls_4204.as
 */
export class RewardTrackPrizeData
{
    // AS3: _SafeCls_4204.as::get id()
    public readonly id: string;

    // AS3: _SafeCls_4204.as::get requiredPoints()
    public readonly requiredPoints: number;

    // AS3: _SafeCls_4204.as::get productItemTypeId()
    public readonly productItemTypeId: number;

    // AS3: _SafeCls_4204.as::get rewardTypeId()
    public readonly rewardTypeId: string;

    // AS3: _SafeCls_4204.as::get extraParams()
    public readonly extraParams: string;

    // AS3: _SafeCls_4204.as::get rewardAmount()
    public readonly rewardAmount: number;

    // AS3: _SafeCls_4204.as::get premium()
    public readonly premium: boolean;

    // AS3: _SafeCls_4204.as::get available()
    public readonly available: boolean;

    // AS3: _SafeCls_4204.as::get claimed()
    public readonly claimed: boolean;

    // AS3: _SafeCls_4204.as::_SafeCls_4204()
    constructor(wrapper: IMessageDataWrapper)
    {
        this.id = wrapper.readString();
        this.requiredPoints = wrapper.readInt();
        this.productItemTypeId = wrapper.readShort();
        this.rewardTypeId = wrapper.readString();
        this.extraParams = wrapper.readString();
        this.rewardAmount = wrapper.readInt();
        this.premium = wrapper.readBoolean();
        this.available = wrapper.readBoolean();
        this.claimed = wrapper.readBoolean();
    }
}
