import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboQuestEngine} from './HabboQuestEngine';

/**
 * A skinned, animated progress bar built from the "ProgressBar" widget layout.
 *
 * Used both in-frame (achievements' in-level / total-category bars) and standalone
 * (quest tracker). The bar's fill width eases toward its target rather than jumping,
 * driven by a self-contained ticker (AS3 drives this from HabboQuestEngine.update(),
 * called every engine frame; the port has no equivalent frame-wide tick hook yet, so
 * this class runs its own interval instead — same visual result, no new engine wiring).
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/ProgressBar.as
 */
export class ProgressBar
{
    // AS3: ProgressBar.as::CONTAINER_SPACING (declared but unused by AS3 itself)
    private static readonly TICK_INTERVAL_MS: number = 33;

    private _engine: HabboQuestEngine | null;
    private _window: IWindowContainer;
    private _progressBarWidth: number;
    private _progressKey: string;
    private _hasFrame: boolean;
    private _percentageMode: boolean;

    private _currentAmount: number = 0;
    private _maxAmount: number = 0;
    private _changeId: number = 0;
    private _offset: number = 0;
    private _startProgressWidth: number = 0;
    private _currentProgressWidth: number = 0;
    private _isUpdating: boolean = false;

    private _tickTimer: ReturnType<typeof setInterval> | null = null;

    // AS3: ProgressBar.as::ProgressBar()
    constructor(
        engine: HabboQuestEngine,
        container: IWindowContainer,
        width: number,
        progressKey: string,
        hasFrame: boolean,
        location: {x: number, y: number},
        percentageMode: boolean = false
    )
    {
        this._engine = engine;
        this._window = container;
        this._progressBarWidth = width;
        this._progressKey = progressKey;
        this._hasFrame = hasFrame;
        this._percentageMode = percentageMode;

        let bar = container.findChildByName('progress_bar_cont') as IWindowContainer | null;

        if(bar === null)
        {
            bar = this._engine.windowManager?.buildWidgetLayout('ProgressBar') as unknown as IWindowContainer ?? null;

            if(bar !== null)
            {
                container.addChild(bar);
                bar.x = location.x;
                bar.y = location.y;
                bar.width = this._progressBarWidth + 10;
            }
        }

        this._tickTimer = setInterval(() => this.updateView(ProgressBar.TICK_INTERVAL_MS), ProgressBar.TICK_INTERVAL_MS);
    }

    // AS3: ProgressBar.as::refresh()
    refresh(currentAmount: number, maxAmount: number, changeId: number, offset: number): void
    {
        const changed = changeId !== this._changeId || maxAmount !== this._maxAmount;

        this._maxAmount = maxAmount;
        this._currentAmount = currentAmount;
        this._startProgressWidth = this._currentProgressWidth;
        this._changeId = changeId;
        this._offset = offset;

        if(changed)
        {
            this._currentProgressWidth = this.getProgressWidth(this._currentAmount);
        }

        this._isUpdating = true;
        this.updateView();
    }

    // AS3: ProgressBar.as::set visible()
    set visible(value: boolean)
    {
        const bar = this._window.findChildByName('progress_bar_cont');

        if(bar !== null)
        {
            bar.visible = value;
        }
    }

    // AS3: ProgressBar.as::updateView()
    updateView(elapsedMs: number = 0): void
    {
        if(!this._isUpdating) return;

        const barBackground = this._window.findChildByName('bar_a_bkg');
        const barFillCenter = this._window.findChildByName('bar_a_c');
        const barFillRight = this._window.findChildByName('bar_a_r');
        const frameLeft = this._window.findChildByName('bar_l');
        const frameCenter = this._window.findChildByName('bar_c');
        const frameRight = this._window.findChildByName('bar_r');

        if(barBackground === null || barFillCenter === null || barFillRight === null
            || frameLeft === null || frameCenter === null || frameRight === null)
        {
            return;
        }

        frameLeft.visible = this._hasFrame;
        frameCenter.visible = this._hasFrame;
        frameRight.visible = this._hasFrame;

        if(this._hasFrame)
        {
            frameCenter.width = this._progressBarWidth;
            frameRight.x = this._progressBarWidth + frameCenter.x;
        }

        const targetWidth = this.getProgressWidth(this._currentAmount);

        if(this._currentProgressWidth !== targetWidth)
        {
            const framesFactor = elapsedMs / 32;
            const distance = targetWidth - this._currentProgressWidth;
            const step = Math.max(1, Math.round(framesFactor * Math.round(Math.sqrt(Math.abs(distance)))));

            if(this._currentProgressWidth < targetWidth)
            {
                this._currentProgressWidth = Math.min(targetWidth, this._currentProgressWidth + step);
            }
            else
            {
                this._currentProgressWidth = Math.max(targetWidth, this._currentProgressWidth - step);
            }
        }

        const fillVisible = this._currentProgressWidth >= 0;

        barBackground.visible = fillVisible;
        barFillCenter.visible = fillVisible;
        barFillRight.visible = fillVisible;

        if(fillVisible)
        {
            const range = targetWidth - this._startProgressWidth;

            barFillCenter.blend = range !== 0 ? 1 - (targetWidth - this._currentProgressWidth) / range : 1;
            barFillCenter.width = this._currentProgressWidth;
            barFillRight.x = this._currentProgressWidth + barFillCenter.x;
            barBackground.width = barFillRight.right - barFillCenter.left;
        }

        this._isUpdating = this._currentProgressWidth !== targetWidth;

        const progressText = this._window.findChildByName('progress_txt');

        if(progressText === null) return;

        const displayedAmount = this._isUpdating
            ? Math.round(this._currentProgressWidth / this._progressBarWidth * this._maxAmount)
            : this._currentAmount;

        const localization = this._engine?.localization ?? null;

        if(localization !== null)
        {
            if(this._percentageMode)
            {
                const percent = Math.floor(displayedAmount * 1 / this._maxAmount * 100);

                progressText.caption = localization.getLocalizationWithParams(
                    this._progressKey, this._progressKey, 'progress', String(percent)
                );
            }
            else
            {
                progressText.caption = localization.getLocalizationWithParams(
                    this._progressKey, this._progressKey,
                    'progress', String(displayedAmount + this._offset),
                    'limit', String(this._maxAmount + this._offset)
                );
            }
        }

        progressText.x = 3 + barFillCenter.x + (this._progressBarWidth - progressText.width) / 2;
    }

    // AS3: ProgressBar.as::dispose()
    dispose(): void
    {
        if(this._tickTimer !== null)
        {
            clearInterval(this._tickTimer);
            this._tickTimer = null;
        }

        this._engine = null;
    }

    // AS3: ProgressBar.as::get disposed()
    get disposed(): boolean
    {
        return this._engine === null;
    }

    // AS3: ProgressBar.as::get isUpdating()
    get isUpdating(): boolean
    {
        return this._isUpdating;
    }

    // AS3: ProgressBar.as::getProgressWidth()
    private getProgressWidth(amount: number): number
    {
        if(this._maxAmount === 0) return 0;

        return Math.max(0, Math.round(this._progressBarWidth * amount / this._maxAmount));
    }
}
