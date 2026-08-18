/**
 * How many reward-track prizes are claimable right now, across every track.
 *
 * Raised by `RewardTrackController.broadcastClaimableRewardsCount()` — which counts prizes that are
 * `isClaimable()`, i.e. unlocked, paid for in points, and not yet taken. Note the asymmetry with
 * its two siblings: this one counts things the player *can act on*, not things they have not seen.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/events/UnseenRewardTrackRewardsCountUpdateEvent.as
 */
export class UnseenRewardTrackRewardsCountUpdateEvent
{
    // AS3: UnseenRewardTrackRewardsCountUpdateEvent.as::TYPE
    public static readonly TYPE: string = 'qe_urtrcue';

    // AS3: UnseenRewardTrackRewardsCountUpdateEvent.as::_count
    private _count: number;

    // AS3: UnseenRewardTrackRewardsCountUpdateEvent.as::UnseenRewardTrackRewardsCountUpdateEvent()
    constructor(count: number)
    {
        this._count = count;
    }

    // AS3: UnseenRewardTrackRewardsCountUpdateEvent.as::get count()
    get count(): number
    {
        return this._count;
    }
}
