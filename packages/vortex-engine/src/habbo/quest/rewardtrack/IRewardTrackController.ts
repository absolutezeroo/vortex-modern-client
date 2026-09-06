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

    /**
     * The id of the track a caller outside the reward track should open — the season in progress.
     *
     * Exposed as an id rather than a `RewardTrack` to keep this interface free of the track model,
     * which is the reason the class note above gives for it being narrow.
     */
    // DEVIATION: AS3 has no selected track; its one caller (the toolbar's Progression menu)
    //   hardcodes the id `introduction`, which is all that build shipped. See
    //   `RewardTrackController.activeTrack` for why the rest of the stack was already id-driven.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/IRewardTrackController.as
    readonly activeTrackId: string | null;
}
