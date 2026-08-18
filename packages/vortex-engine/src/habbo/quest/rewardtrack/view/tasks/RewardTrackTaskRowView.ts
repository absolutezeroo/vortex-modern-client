/**
 * RewardTrackTaskRowView — one task in the list: its icon, name, description, progress bar and the
 * points its current rung pays.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/view/tasks/RewardTrackTaskRowView.as
 *
 * `refresh()` carries the level-up handover: it remembers the rung index it was showing, then hands
 * both the task and that previous index to the progress bar, which is what lets the bar fill to
 * full before snapping back down (see `RewardTrackTaskProgressBarView`).
 *
 * The border has three states in priority order — selected, hovered, resting — and the resting
 * colour is the layout's own, captured before any theming of this row.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {RewardTrackTask} from '../../data/RewardTrackTask';
import type {RewardTrackController} from '../../RewardTrackController';
import {RewardTrackTaskProgressBarView} from '../progress/RewardTrackTaskProgressBarView';
import type {RewardTrackTheme} from '../theme/RewardTrackTheme';
import type {RewardTrackTaskListView} from './RewardTrackTaskListView';

export class RewardTrackTaskRowView
{
    /** Derived name — `_SafeStr_4593`. */
    // AS3: RewardTrackTaskRowView.as::_SafeStr_4593
    private _controller: RewardTrackController | null;

    /** Derived name — `_SafeStr_7636`: the list this row belongs to. */
    // AS3: RewardTrackTaskRowView.as::_SafeStr_7636
    private _listView: RewardTrackTaskListView | null;

    /** Derived name — `_SafeStr_4804`. */
    // AS3: RewardTrackTaskRowView.as::_SafeStr_4804
    private _task: RewardTrackTask | null;

    // AS3: RewardTrackTaskRowView.as::_theme
    private _theme: RewardTrackTheme | null;

    // AS3: RewardTrackTaskRowView.as::_window
    private _window: IWindowContainer | null;

    /** Derived name — `_SafeStr_5984`. */
    // AS3: RewardTrackTaskRowView.as::_SafeStr_5984
    private _progressBar: RewardTrackTaskProgressBarView | null;

    // AS3: RewardTrackTaskRowView.as::_defaultBorderColor
    private _defaultBorderColor: number;

    /** Derived name — `_SafeStr_7850`: the rung index the row last rendered. */
    // AS3: RewardTrackTaskRowView.as::_SafeStr_7850
    private _lastLevelIndex: number;

    // AS3: RewardTrackTaskRowView.as::_selected
    private _selected: boolean = false;

    /** Derived name — `_SafeStr_5943`. */
    // AS3: RewardTrackTaskRowView.as::_SafeStr_5943
    private _hovered: boolean = false;

    // AS3: RewardTrackTaskRowView.as::_disposed
    private _disposed: boolean = false;

    // AS3: RewardTrackTaskRowView.as::RewardTrackTaskRowView()
    constructor(
        template: IWindowContainer,
        controller: RewardTrackController,
        listView: RewardTrackTaskListView,
        task: RewardTrackTask,
        theme: RewardTrackTheme
    )
    {
        this._controller = controller;
        this._listView = listView;
        this._task = task;
        this._theme = theme;

        this._window = (template as unknown as IWindow).clone() as unknown as IWindowContainer;
        this._progressBar = new RewardTrackTaskProgressBarView(this.loadingBar!);
        this._defaultBorderColor = (this.taskBorder as unknown as IWindow | null)?.color ?? 0;

        const window = this._window as unknown as IWindow;

        window.addEventListener('WME_CLICK', this.onClick);
        window.addEventListener('WME_OVER', this.onMouseOver);
        window.addEventListener('WME_OUT', this.onMouseOut);

        this._lastLevelIndex = task.activeLevelIndex;

        this.initialize();
    }

    // AS3: RewardTrackTaskRowView.as::initialize()
    private initialize(): void
    {
        const task = this._task;

        if(task === null) return;

        const prefix = `reward_track.${task.track.id}.task.${task.id}`;

        this.setText(this.taskNameText, this.localize(`${prefix}.name`));
        this.setText(this.taskDescriptionText, this.localize(`${prefix}.desc`));

        const image = this.taskImage;

        if(image !== null) image.assetUri = `reward_track_tasks_${task.actionType.toLowerCase()}`;

        this.refresh(false);
    }

    // AS3: RewardTrackTaskRowView.as::refresh()
    public refresh(animate: boolean): void
    {
        const task = this._task;

        if(task === null) return;

        const previousLevelIndex = this._lastLevelIndex;

        this._lastLevelIndex = task.activeLevelIndex;

        this._progressBar?.refreshTask(task, animate, previousLevelIndex);

        this.setText(this.progressText, `${task.progressCount} / ${task.activeLevel.requiredCount}`);
        this.setText(this.rewardText, String(task.activeLevel.pointsReward));
    }

    // AS3: RewardTrackTaskRowView.as::setSelected()
    public setSelected(selected: boolean): void
    {
        if(this._selected === selected) return;

        this._selected = selected;

        this.refreshBorder();
    }

    // AS3: RewardTrackTaskRowView.as::update()
    public update(deltaMs: number): void
    {
        this._progressBar?.update(deltaMs);
    }

    // AS3: RewardTrackTaskRowView.as::onClick()
    private onClick = (): void =>
    {
        if(this._task !== null) this._listView?.selectTask(this._task);
    };

    // AS3: RewardTrackTaskRowView.as::onMouseOver()
    private onMouseOver = (): void =>
    {
        this._hovered = true;

        this.refreshBorder();
    };

    // AS3: RewardTrackTaskRowView.as::onMouseOut()
    private onMouseOut = (): void =>
    {
        this._hovered = false;

        this.refreshBorder();
    };

    // AS3: RewardTrackTaskRowView.as::refreshBorder()
    private refreshBorder(): void
    {
        const border = this.taskBorder as unknown as IWindow | null;

        if(border === null) return;

        if(this._selected)
        {
            border.color = this._theme?.activeColor ?? this._defaultBorderColor;
        }
        else if(this._hovered)
        {
            border.color = this._theme?.lightColor ?? this._defaultBorderColor;
        }
        else
        {
            border.color = this._defaultBorderColor;
        }
    }

    // AS3: RewardTrackTaskRowView.as::localize()
    private localize(key: string): string
    {
        return this._controller?.localizationManager?.getLocalizationWithParams(key, key) ?? key;
    }

    // TS-only: the null-guarded form of AS3's `someTextWindow.text = value`.
    private setText(target: ITextWindow | null, value: string): void
    {
        if(target !== null) target.text = value;
    }

    // AS3: RewardTrackTaskRowView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: RewardTrackTaskRowView.as::get task()
    public get task(): RewardTrackTask | null
    {
        return this._task;
    }

    // AS3: RewardTrackTaskRowView.as::get window()
    public get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: RewardTrackTaskRowView.as::get taskNameText()
    private get taskNameText(): ITextWindow | null
    {
        return (this._window?.findChildByName('task_name') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackTaskRowView.as::get taskDescriptionText()
    private get taskDescriptionText(): ITextWindow | null
    {
        return (this._window?.findChildByName('task_description') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackTaskRowView.as::get taskBorder()
    private get taskBorder(): IWindowContainer | null
    {
        return (this._window?.findChildByName('task_border') ?? null) as IWindowContainer | null;
    }

    // AS3: RewardTrackTaskRowView.as::get progressText()
    private get progressText(): ITextWindow | null
    {
        return (this._window?.findChildByName('task_progress_txt') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackTaskRowView.as::get rewardText()
    private get rewardText(): ITextWindow | null
    {
        return (this._window?.findChildByName('track_reward_txt') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackTaskRowView.as::get taskImage()
    private get taskImage(): IStaticBitmapWrapperWindow | null
    {
        return (this._window?.findChildByName('task_image') ?? null) as IStaticBitmapWrapperWindow | null;
    }

    // AS3: RewardTrackTaskRowView.as::get loadingBar()
    private get loadingBar(): IWindowContainer | null
    {
        return (this._window?.findChildByName('loading_bar') ?? null) as IWindowContainer | null;
    }

    // AS3: RewardTrackTaskRowView.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        const window = this._window as unknown as IWindow | null;

        window?.removeEventListener('WME_CLICK', this.onClick);
        window?.removeEventListener('WME_OVER', this.onMouseOver);
        window?.removeEventListener('WME_OUT', this.onMouseOut);

        this._progressBar?.dispose();
        this._progressBar = null;

        window?.dispose();
        this._window = null;

        this._controller = null;
        this._listView = null;
        this._task = null;
        this._theme = null;
    }
}
