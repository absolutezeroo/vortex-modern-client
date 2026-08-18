/**
 * The three states the task-list filter buttons switch between.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/view/tasks/_SafeCls_4485.as
 *
 * **The class name is DERIVED** — AS3 leaves it `_SafeCls_4485`, and the reward track postdates
 * every tree that could recover it. The three constants themselves are unobfuscated. Named for
 * `RewardTrackTaskListView`'s filter buttons, its only consumer.
 */
export class RewardTrackTaskFilter
{
    // AS3: _SafeCls_4485.as::ALL
    public static readonly ALL: number = 0;

    // AS3: _SafeCls_4485.as::IN_PROGRESS
    public static readonly IN_PROGRESS: number = 1;

    // AS3: _SafeCls_4485.as::COMPLETED
    public static readonly COMPLETED: number = 2;
}
