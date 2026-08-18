/**
 * RewardTrackTaskLevelView — one rung of a task, shown in the task-details panel: its name, its
 * point payout, a progress bar and a tick.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/view/tasks/RewardTrackTaskLevelView.as
 *
 * **Recycled through a static pool.** `create()` pops a spare before cloning a new one, and
 * `recycle()` pushes it back — so a view outlives the task it was showing, and `initialize()` has
 * to reset everything it reads. Note `recycle()` deliberately does *not* clear the window or the
 * progress bar: those are the parts being reused.
 *
 * `lockedIcon` is hidden unconditionally in `refresh()` — AS3 does the same, so the layout's lock
 * overlay is effectively dead on this view.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {RewardTrackTask} from '../../data/RewardTrackTask';
import type {RewardTrackTaskLevel} from '../../data/RewardTrackTaskLevel';
import type {RewardTrackController} from '../../RewardTrackController';
import {RewardTrackTaskProgressBarView} from '../progress/RewardTrackTaskProgressBarView';
import type {RewardTrackTheme} from '../theme/RewardTrackTheme';

export class RewardTrackTaskLevelView
{
    /** Derived name — `_SafeStr_7562`: the recycle pool, shared by every instance. */
    // AS3: RewardTrackTaskLevelView.as::_SafeStr_7562
    private static readonly POOL: RewardTrackTaskLevelView[] = [];

    /** Derived name — `_SafeStr_4593`. */
    // AS3: RewardTrackTaskLevelView.as::_SafeStr_4593
    private _controller: RewardTrackController | null = null;

    /** Derived name — `_SafeStr_4804`. */
    // AS3: RewardTrackTaskLevelView.as::_SafeStr_4804
    private _task: RewardTrackTask | null = null;

    /** Derived name — `_SafeStr_6012`: the rung this view shows. */
    // AS3: RewardTrackTaskLevelView.as::_SafeStr_6012
    private _level: RewardTrackTaskLevel | null = null;

    // AS3: RewardTrackTaskLevelView.as::_theme
    private _theme: RewardTrackTheme | null = null;

    // AS3: RewardTrackTaskLevelView.as::_index
    private _index: number = 0;

    // AS3: RewardTrackTaskLevelView.as::_window
    private _window: IWindowContainer | null;

    /** Derived name — `_SafeStr_5984`. */
    // AS3: RewardTrackTaskLevelView.as::_SafeStr_5984
    private _progressBar: RewardTrackTaskProgressBarView | null;

    // AS3: RewardTrackTaskLevelView.as::_defaultBorderColor
    private _defaultBorderColor: number;

    // AS3: RewardTrackTaskLevelView.as::_disposed
    private _disposed: boolean = false;

    // AS3: RewardTrackTaskLevelView.as::RewardTrackTaskLevelView()
    constructor(template: IWindowContainer)
    {
        this._window = (template as unknown as IWindow).clone() as unknown as IWindowContainer;
        this._progressBar = new RewardTrackTaskProgressBarView(this.loadingBar!);
        this._defaultBorderColor = (this.levelBorder as unknown as IWindow | null)?.color ?? 0;
    }

    // AS3: RewardTrackTaskLevelView.as::create()
    public static create(
        template: IWindowContainer,
        controller: RewardTrackController,
        task: RewardTrackTask,
        level: RewardTrackTaskLevel,
        index: number,
        theme: RewardTrackTheme
    ): RewardTrackTaskLevelView
    {
        const view = RewardTrackTaskLevelView.POOL.length > 0
            ? RewardTrackTaskLevelView.POOL.pop()!
            : new RewardTrackTaskLevelView(template);

        view.initialize(controller, task, level, index, theme);

        return view;
    }

    // AS3: RewardTrackTaskLevelView.as::initialize()
    public initialize(
        controller: RewardTrackController,
        task: RewardTrackTask,
        level: RewardTrackTaskLevel,
        index: number,
        theme: RewardTrackTheme
    ): void
    {
        this._controller = controller;
        this._task = task;
        this._level = level;
        this._index = index;
        this._theme = theme;

        const name = this.levelNameText;

        if(name !== null)
        {
            name.text = controller.localizationManager?.getLocalizationWithParams(
                'reward_track.levels.level', '', 'level', String(index + 1)
            ) ?? '';
        }

        const reward = this.rewardText;

        if(reward !== null) reward.text = String(level.pointsReward);

        this.refresh(false);
    }

    // AS3: RewardTrackTaskLevelView.as::refresh()
    public refresh(animate: boolean): void
    {
        const task = this._task;
        const level = this._level;

        if(task === null || level === null) return;

        const ratio = task.progressRatioFor(level);

        this._progressBar?.refreshRatio(ratio, animate);

        const progress = this.progressText;

        if(progress !== null) progress.text = `${task.progressCount} / ${level.requiredCount}`;

        const completed = this.completedIcon;
        const locked = this.lockedIcon;

        if(completed !== null) completed.visible = ratio >= 1;
        if(locked !== null) locked.visible = false;

        const border = this.levelBorder as unknown as IWindow | null;

        if(border !== null)
        {
            border.color = this._index === task.activeLevelIndex
                ? (this._theme?.activeColor ?? this._defaultBorderColor)
                : this._defaultBorderColor;
        }
    }

    // AS3: RewardTrackTaskLevelView.as::update()
    public update(deltaMs: number): void
    {
        this._progressBar?.update(deltaMs);
    }

    /** Returns this view to the pool. The window and progress bar are kept — that is the point. */
    // AS3: RewardTrackTaskLevelView.as::recycle()
    public recycle(): void
    {
        this._controller = null;
        this._task = null;
        this._level = null;
        this._theme = null;
        this._index = 0;

        RewardTrackTaskLevelView.POOL.push(this);
    }

    // AS3: RewardTrackTaskLevelView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: RewardTrackTaskLevelView.as::get window()
    public get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: RewardTrackTaskLevelView.as::get levelNameText()
    private get levelNameText(): ITextWindow | null
    {
        return (this._window?.findChildByName('level_name') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackTaskLevelView.as::get levelBorder()
    private get levelBorder(): IWindowContainer | null
    {
        return (this._window?.findChildByName('level_border') ?? null) as IWindowContainer | null;
    }

    // AS3: RewardTrackTaskLevelView.as::get progressText()
    private get progressText(): ITextWindow | null
    {
        return (this._window?.findChildByName('level_progress_txt') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackTaskLevelView.as::get rewardText()
    private get rewardText(): ITextWindow | null
    {
        return (this._window?.findChildByName('level_reward_txt') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackTaskLevelView.as::get completedIcon()
    private get completedIcon(): IWindow | null
    {
        return this._window?.findChildByName('completed_icon') ?? null;
    }

    // AS3: RewardTrackTaskLevelView.as::get lockedIcon()
    private get lockedIcon(): IWindow | null
    {
        return this._window?.findChildByName('locked_icon') ?? null;
    }

    // AS3: RewardTrackTaskLevelView.as::get loadingBar()
    private get loadingBar(): IWindowContainer | null
    {
        return (this._window?.findChildByName('loading_bar') ?? null) as IWindowContainer | null;
    }

    // AS3: RewardTrackTaskLevelView.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        this._progressBar?.dispose();
        this._progressBar = null;

        (this._window as unknown as IWindow | null)?.dispose();
        this._window = null;

        this._controller = null;
        this._task = null;
        this._level = null;
        this._theme = null;
    }
}
