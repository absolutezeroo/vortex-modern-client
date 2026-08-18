/**
 * The three questions other subsystems ask the reward track.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/IRewardTrackController.as
 *
 * Deliberately narrow: everything the views need they reach through the concrete
 * `RewardTrackController`, so this is only what a *caller outside* the reward track can use.
 */
export interface IRewardTrackController
{
    // AS3: IRewardTrackController.as::openRewardTrack()
    openRewardTrack(trackId: string): void;

    // AS3: IRewardTrackController.as::hasRewardTrack()
    hasRewardTrack(trackId: string): boolean;

    // AS3: IRewardTrackController.as::isRewardTrackComplete()
    isRewardTrackComplete(trackId: string): boolean;
}
