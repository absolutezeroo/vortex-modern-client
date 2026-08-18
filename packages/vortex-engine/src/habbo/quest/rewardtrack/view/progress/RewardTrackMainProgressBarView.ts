/**
 * RewardTrackMainProgressBarView — the long bar across the prize track.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/view/progress/RewardTrackMainProgressBarView.as
 *
 * Adds a rounded cap: a `shape` child kept 4px ahead of the fill, snapped flush to the container
 * once the fill is within 4px of full so the cap does not overhang the end.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {RewardTrackProgressBarViewBase} from './RewardTrackProgressBarViewBase';

export class RewardTrackMainProgressBarView extends RewardTrackProgressBarViewBase
{
    /** AS3's literal `4` — how far the cap leads the fill. */
    // AS3: RewardTrackMainProgressBarView.as::render()
    private static readonly CAP_OVERHANG: number = 4;

    /** Derived name — `_SafeStr_6453`: the rounded cap at the end of the fill. */
    // AS3: RewardTrackMainProgressBarView.as::_SafeStr_6453
    private _shape: IWindow | null;

    // AS3: RewardTrackMainProgressBarView.as::RewardTrackMainProgressBarView()
    constructor(container: IWindowContainer)
    {
        super(container);

        this._shape = container.findChildByName('shape');
    }

    /** The prize track positions in pixels, so it sets the ratio from an x rather than a fraction. */
    // AS3: RewardTrackMainProgressBarView.as::refreshByX()
    public refreshByX(x: number, animate: boolean): void
    {
        const width = (this._container as unknown as IWindow | null)?.width ?? 0;

        this.setRatio(width === 0 ? 0 : x / width, animate);
    }

    // AS3: RewardTrackMainProgressBarView.as::render()
    protected override render(): void
    {
        super.render();

        const container = this._container as unknown as IWindow | null;
        const progress = this._progress as unknown as IWindow | null;

        if(this._shape === null || container === null || progress === null) return;

        const overhang = RewardTrackMainProgressBarView.CAP_OVERHANG;

        if(progress.width >= container.width - overhang)
        {
            this._shape.width = container.width;
        }
        else if(this._shape.width !== progress.width + overhang)
        {
            this._shape.width = progress.width + overhang;
        }
    }
}
