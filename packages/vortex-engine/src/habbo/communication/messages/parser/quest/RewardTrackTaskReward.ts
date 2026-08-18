import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One rung of a reward-track task: hit `requiredCount` and you are paid `pointsReward`.
 *
 * **The name is DERIVED.** The reward track is new in the 2026 build — `win63_version` has no
 * message file for it, PRODUCTION predates it entirely, and the emulator has no header. Named for
 * the `taskRewards` collection that holds it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2623/_SafeCls_4391.as
 */
export class RewardTrackTaskReward
{
    // AS3: _SafeCls_4391.as::get requiredCount()
    public readonly requiredCount: number;

    // AS3: _SafeCls_4391.as::get pointsReward()
    public readonly pointsReward: number;

    // AS3: _SafeCls_4391.as::get premium()
    public readonly premium: boolean;

    // AS3: _SafeCls_4391.as::_SafeCls_4391()
    constructor(wrapper: IMessageDataWrapper)
    {
        this.requiredCount = wrapper.readInt();
        this.pointsReward = wrapper.readInt();
        this.premium = wrapper.readBoolean();
    }
}
