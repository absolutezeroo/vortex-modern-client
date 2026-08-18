import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {RewardTrackTaskReward} from './RewardTrackTaskReward';

/**
 * One task on a reward track, with the rungs it pays out at.
 *
 * **The name is DERIVED**; see `RewardTrackTaskReward` for why. Named for the `tasks` collection
 * that holds it and for the unobfuscated `RewardTrackTask` model class that wraps it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2623/_SafeCls_4299.as
 */
export class RewardTrackTaskData
{
    // AS3: _SafeCls_4299.as::get id()
    public readonly id: string;

    // AS3: _SafeCls_4299.as::get actionType()
    public readonly actionType: string;

    // AS3: _SafeCls_4299.as::get parameter()
    public readonly parameter: string;

    // AS3: _SafeCls_4299.as::get progressCount()
    public readonly progressCount: number;

    // AS3: _SafeCls_4299.as::get premium()
    public readonly premium: boolean;

    // AS3: _SafeCls_4299.as::get taskRewards()
    public readonly taskRewards: RewardTrackTaskReward[] = [];

    // AS3: _SafeCls_4299.as::_SafeCls_4299()
    constructor(wrapper: IMessageDataWrapper)
    {
        this.id = wrapper.readString();
        this.actionType = wrapper.readString();
        this.parameter = wrapper.readString();
        this.progressCount = wrapper.readInt();
        this.premium = wrapper.readBoolean();

        const count = wrapper.readInt();

        for(let index = 0; index < count; index++)
        {
            this.taskRewards.push(new RewardTrackTaskReward(wrapper));
        }
    }
}
