/**
 * RewardTrackTaskProgressBarView — the small bar on a task row.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/view/progress/RewardTrackTaskProgressBarView.as
 *
 * The one piece of real behaviour here is the **level-up flourish**. When a task crosses a rung the
 * bar should not jump backwards to the next rung's small ratio — it first fills to 1, and only once
 * that animation settles does it snap to the real ratio. `_pendingRatio` holds that value in the
 * meantime, and `update()` is where the handover happens.
 */
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {RewardTrackTask} from '../../data/RewardTrackTask';
import {RewardTrackProgressBarViewBase} from './RewardTrackProgressBarViewBase';

export class RewardTrackTaskProgressBarView extends RewardTrackProgressBarViewBase
{
    /** Derived name — `_SafeStr_6326`: the ratio to snap to once the fill-to-full settles, -1 = none. */
    // AS3: RewardTrackTaskProgressBarView.as::_SafeStr_6326
    private _pendingRatio: number = -1;

    // AS3: RewardTrackTaskProgressBarView.as::RewardTrackTaskProgressBarView()
    constructor(container: IWindowContainer)
    {
        super(container, true);
    }

    // AS3: RewardTrackTaskProgressBarView.as::refreshRatio()
    public refreshRatio(ratio: number, animate: boolean, levelChanged: boolean = false): void
    {
        if(levelChanged && animate)
        {
            this._pendingRatio = ratio;
            this.setRatio(1, true);

            return;
        }

        this._pendingRatio = -1;
        this.setRatio(ratio, animate);
    }

    /**
     * `previousLevelIndex` of -1 means "no previous state to compare", so the flourish is skipped —
     * that is the first render of a row rather than a level-up.
     */
    // AS3: RewardTrackTaskProgressBarView.as::refreshTask()
    public refreshTask(task: RewardTrackTask, animate: boolean, previousLevelIndex: number = -1): void
    {
        const levelChanged = previousLevelIndex !== -1 && previousLevelIndex !== task.activeLevelIndex;

        this.refreshRatio(task.progressRatioFor(task.activeLevel), animate, levelChanged);
    }

    // AS3: RewardTrackTaskProgressBarView.as::update()
    public override update(deltaMs: number): void
    {
        super.update(deltaMs);

        if(this._pendingRatio >= 0 && !this.isUpdating)
        {
            const ratio = this._pendingRatio;

            this._pendingRatio = -1;

            this.setRatio(ratio, false);
        }
    }
}
