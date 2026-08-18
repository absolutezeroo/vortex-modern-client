/**
 * RewardTrackTaskLevel — one rung of a task: hit `requiredCount` and the track pays `pointsReward`.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/data/RewardTrackTaskLevel.as
 *
 * A read-only copy of the wire DTO, taken once at construction. The model layer never reads the
 * parser objects again, which is what lets the controller mutate progress locally between packets.
 */
import type {RewardTrackTaskReward} from '@habbo/communication/messages/parser/quest/RewardTrackTaskReward';

export class RewardTrackTaskLevel
{
    // AS3: RewardTrackTaskLevel.as::_SafeStr_9242
    private _requiredCount: number;

    // AS3: RewardTrackTaskLevel.as::_SafeStr_8856
    private _pointsReward: number;

    // AS3: RewardTrackTaskLevel.as::_SafeStr_7937
    private _premium: boolean;

    // AS3: RewardTrackTaskLevel.as::RewardTrackTaskLevel()
    constructor(data: RewardTrackTaskReward)
    {
        this._requiredCount = data.requiredCount;
        this._pointsReward = data.pointsReward;
        this._premium = data.premium;
    }

    // AS3: RewardTrackTaskLevel.as::get requiredCount()
    get requiredCount(): number
    {
        return this._requiredCount;
    }

    // AS3: RewardTrackTaskLevel.as::get pointsReward()
    get pointsReward(): number
    {
        return this._pointsReward;
    }

    // AS3: RewardTrackTaskLevel.as::get premium()
    get premium(): boolean
    {
        return this._premium;
    }
}
