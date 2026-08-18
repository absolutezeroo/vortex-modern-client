import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {RewardTrackTaskData} from './RewardTrackTaskData';
import {RewardTrackPrizeData} from './RewardTrackPrizeData';

/**
 * One whole reward track: its tasks, its prizes, and its premium terms.
 *
 * **The name is DERIVED**; see `RewardTrackTaskReward` for why.
 *
 * **Four fields are read conditionally.** `taskPointsBoost` (a `double`, the only one in this
 * family), `instantPoints`, `costDiamonds` and `costCredits` are on the wire only when
 * `hasPremiumConfig` is set — reading them unconditionally desyncs every track after the first
 * that has no premium tier.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2623/_SafeCls_2628.as
 */
export class RewardTrackData
{
    // AS3: _SafeCls_2628.as::get id()
    public readonly id: string;

    // AS3: _SafeCls_2628.as::get theme()
    public readonly theme: string;

    // AS3: _SafeCls_2628.as::get points()
    public readonly points: number;

    // AS3: _SafeCls_2628.as::get hasPremiumConfig()
    public readonly hasPremiumConfig: boolean;

    // AS3: _SafeCls_2628.as::get taskPointsBoost()
    public readonly taskPointsBoost: number = 0;

    // AS3: _SafeCls_2628.as::get instantPoints()
    public readonly instantPoints: number = 0;

    // AS3: _SafeCls_2628.as::get costDiamonds()
    public readonly costDiamonds: number = 0;

    // AS3: _SafeCls_2628.as::get costCredits()
    public readonly costCredits: number = 0;

    // AS3: _SafeCls_2628.as::get premium()
    public readonly premium: boolean;

    // AS3: _SafeCls_2628.as::get complete()
    public readonly complete: boolean;

    // AS3: _SafeCls_2628.as::get premiumComplete()
    public readonly premiumComplete: boolean;

    // AS3: _SafeCls_2628.as::get tasks()
    public readonly tasks: RewardTrackTaskData[] = [];

    // AS3: _SafeCls_2628.as::get prizes()
    public readonly prizes: RewardTrackPrizeData[] = [];

    // AS3: _SafeCls_2628.as::_SafeCls_2628()
    constructor(wrapper: IMessageDataWrapper)
    {
        this.id = wrapper.readString();
        this.theme = wrapper.readString();
        this.points = wrapper.readInt();
        this.hasPremiumConfig = wrapper.readBoolean();

        if(this.hasPremiumConfig)
        {
            this.taskPointsBoost = wrapper.readDouble();
            this.instantPoints = wrapper.readInt();
            this.costDiamonds = wrapper.readInt();
            this.costCredits = wrapper.readInt();
        }

        this.premium = wrapper.readBoolean();
        this.complete = wrapper.readBoolean();
        this.premiumComplete = wrapper.readBoolean();

        let count = wrapper.readInt();

        for(let index = 0; index < count; index++)
        {
            this.tasks.push(new RewardTrackTaskData(wrapper));
        }

        count = wrapper.readInt();

        for(let index = 0; index < count; index++)
        {
            this.prizes.push(new RewardTrackPrizeData(wrapper));
        }
    }
}
