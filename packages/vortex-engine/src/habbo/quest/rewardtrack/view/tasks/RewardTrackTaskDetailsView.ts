/**
 * RewardTrackTaskDetailsView — the panel beside the task list showing the selected task's rungs.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/view/tasks/RewardTrackTaskDetailsView.as
 *
 * Every rung view comes from `RewardTrackTaskLevelView`'s static pool, so `clear()` and
 * `rebuildLevels()` both `recycle()` rather than dispose — and so does `dispose()`, which is why
 * this view never destroys a rung window it did not create.
 *
 * The hint button is driven by a **hotel property**, not localization: an empty
 * `….hint.internal_link` hides the button entirely, and a non-empty one is fired as an in-client
 * link event.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IScrollableListWindow} from '@core/window/components/IScrollableListWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IInteractiveWindow} from '@core/window/components/IInteractiveWindow';
import type {RewardTrackTask} from '../../data/RewardTrackTask';
import type {RewardTrackController} from '../../RewardTrackController';
import type {RewardTrackTheme} from '../theme/RewardTrackTheme';
import {RewardTrackTaskLevelView} from './RewardTrackTaskLevelView';

export class RewardTrackTaskDetailsView
{
    /** Derived name — `_SafeStr_4593`. */
    // AS3: RewardTrackTaskDetailsView.as::_SafeStr_4593
    private _controller: RewardTrackController | null;

    // AS3: RewardTrackTaskDetailsView.as::_window
    private _window: IWindowContainer | null;

    /** Derived name — `_SafeStr_5521`: the rung template the pool clones from. */
    // AS3: RewardTrackTaskDetailsView.as::_SafeStr_5521
    private _levelTemplate: IWindowContainer | null;

    // AS3: RewardTrackTaskDetailsView.as::_theme
    private _theme: RewardTrackTheme | null;

    /** Derived name — `_SafeStr_4804`. */
    // AS3: RewardTrackTaskDetailsView.as::_SafeStr_4804
    private _task: RewardTrackTask | null = null;

    /** Derived name — `_SafeStr_5062`: the rung views currently on screen. */
    // AS3: RewardTrackTaskDetailsView.as::_SafeStr_5062
    private _levelViews: RewardTrackTaskLevelView[] = [];

    // AS3: RewardTrackTaskDetailsView.as::_hintInternalLink
    private _hintInternalLink: string = '';

    // AS3: RewardTrackTaskDetailsView.as::_disposed
    private _disposed: boolean = false;

    // AS3: RewardTrackTaskDetailsView.as::RewardTrackTaskDetailsView()
    constructor(
        controller: RewardTrackController,
        window: IWindowContainer,
        levelTemplate: IWindowContainer,
        theme: RewardTrackTheme
    )
    {
        this._controller = controller;
        this._window = window;
        this._levelTemplate = levelTemplate;
        this._theme = theme;

        (this.hintButton as unknown as IWindow | null)?.addEventListener('WME_CLICK', this.onHintClicked);

        this.initializeStaffActions();
    }

    // AS3: RewardTrackTaskDetailsView.as::initializeStaffActions()
    private initializeStaffActions(): void
    {
        const region = this.taskNameRegion;

        if(region === null) return;

        const canCopy = this._controller?.canCopyDebugIds ?? false;

        region.interactiveCursorDisabled = !canCopy;

        if(canCopy)
        {
            (region as unknown as IWindow).addEventListener('WME_CLICK', this.onTaskNameClicked);
        }
    }

    // AS3: RewardTrackTaskDetailsView.as::selectTask()
    public selectTask(task: RewardTrackTask, animate: boolean): void
    {
        this._task = task;

        const window = this._window as unknown as IWindow | null;

        if(window !== null) window.visible = true;

        const prefix = `reward_track.${task.track.id}.task.${task.id}`;

        this.setText(this.taskNameText, this.localize(`${prefix}.name`));
        this.setText(this.taskDescriptionText, this.localize(`${prefix}.desc`));
        this.setText(this.taskHintText, this.localize(`${prefix}.hint.desc`));

        const image = this.taskImage;

        if(image !== null) image.assetUri = `reward_track_tasks_${task.actionType.toLowerCase()}`;

        const hintKey = `${prefix}.hint`;

        this._hintInternalLink = this._controller?.getProperty(`${hintKey}.internal_link`) ?? '';

        const hintButton = this.hintButton as unknown as IWindow | null;

        if(hintButton !== null)
        {
            hintButton.visible = this._hintInternalLink !== '';
            hintButton.caption = `\${${hintKey}.button_text}`;
        }

        this.rebuildLevels(animate);
        this.scrollActiveLevelIntoView();
    }

    // AS3: RewardTrackTaskDetailsView.as::clear()
    public clear(): void
    {
        this._task = null;

        const window = this._window as unknown as IWindow | null;

        if(window !== null) window.visible = false;

        this.levelsList?.removeListItems();

        for(const view of this._levelViews)
        {
            view.recycle();
        }

        this._levelViews = [];
    }

    // AS3: RewardTrackTaskDetailsView.as::refresh()
    public refresh(animate: boolean): void
    {
        for(const view of this._levelViews)
        {
            view.refresh(animate);
        }
    }

    // AS3: RewardTrackTaskDetailsView.as::update()
    public update(deltaMs: number): void
    {
        for(const view of this._levelViews)
        {
            view.update(deltaMs);
        }
    }

    // AS3: RewardTrackTaskDetailsView.as::rebuildLevels()
    private rebuildLevels(animate: boolean): void
    {
        const task = this._task;
        const list = this.levelsList;

        if(task === null || this._levelTemplate === null || this._controller === null
            || this._theme === null)
        {
            return;
        }

        list?.removeListItems();

        for(const view of this._levelViews)
        {
            view.recycle();
        }

        this._levelViews = [];

        for(let index = 0; index < task.levels.length; index++)
        {
            const view = RewardTrackTaskLevelView.create(
                this._levelTemplate, this._controller, task, task.levels[index], index, this._theme
            );

            this._levelViews.push(view);

            if(view.window !== null) list?.addListItem(view.window as unknown as IWindow);

            view.refresh(animate);
        }
    }

    /**
     * Scrolls the active rung into view without moving if it is already visible. AS3 works in
     * pixels and divides by `maxScrollV` at the end, because `scrollV` is a 0..1 ratio.
     */
    // AS3: RewardTrackTaskDetailsView.as::scrollActiveLevelIntoView()
    private scrollActiveLevelIntoView(): void
    {
        const list = this.levelsList;
        const task = this._task;

        if(list === null || task === null) return;

        if(list.maxScrollV <= 0)
        {
            list.scrollV = 0;

            return;
        }

        const view = this._levelViews[task.activeLevelIndex];
        const window = view?.window as unknown as IWindow | null;

        if(window == null) return;

        const visible = list.visibleRegion;
        const top = Math.trunc(window.y);
        const bottom = top + window.height;

        let target = visible.y;

        if(top < visible.y)
        {
            target = top;
        }
        else if(bottom > visible.y + visible.height)
        {
            target = bottom - visible.height;
        }

        if(target !== visible.y)
        {
            list.scrollV = target / list.maxScrollV;
        }
    }

    // AS3: RewardTrackTaskDetailsView.as::onHintClicked()
    private onHintClicked = (): void =>
    {
        if(this._hintInternalLink === '') return;

        this._controller?.context.createLinkEvent(this._hintInternalLink);
    };

    // AS3: RewardTrackTaskDetailsView.as::onTaskNameClicked()
    private onTaskNameClicked = (): void =>
    {
        this._controller?.copyTaskId(this._task?.id ?? '');
    };

    // AS3: RewardTrackTaskDetailsView.as::localize()
    private localize(key: string): string
    {
        return this._controller?.localizationManager?.getLocalizationWithParams(key, key) ?? key;
    }

    // TS-only: the null-guarded form of AS3's `someTextWindow.text = value`.
    private setText(target: ITextWindow | null, value: string): void
    {
        if(target !== null) target.text = value;
    }

    // AS3: RewardTrackTaskDetailsView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: RewardTrackTaskDetailsView.as::get taskNameText()
    private get taskNameText(): ITextWindow | null
    {
        return (this._window?.findChildByName('task_info_name') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackTaskDetailsView.as::get taskNameRegion()
    private get taskNameRegion(): IRegionWindow | null
    {
        return (this._window?.findChildByName('task_info_name_region') ?? null) as unknown as IRegionWindow | null;
    }

    // AS3: RewardTrackTaskDetailsView.as::get taskDescriptionText()
    private get taskDescriptionText(): ITextWindow | null
    {
        return (this._window?.findChildByName('task_info_description') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackTaskDetailsView.as::get taskImage()
    private get taskImage(): IStaticBitmapWrapperWindow | null
    {
        return (this._window?.findChildByName('task_info_img') ?? null) as IStaticBitmapWrapperWindow | null;
    }

    // AS3: RewardTrackTaskDetailsView.as::get levelsList()
    private get levelsList(): IScrollableListWindow | null
    {
        return (this._window?.findChildByName('levels') ?? null) as unknown as IScrollableListWindow | null;
    }

    // AS3: RewardTrackTaskDetailsView.as::get taskHintText()
    private get taskHintText(): ITextWindow | null
    {
        return (this._window?.findChildByName('task_hint_text') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackTaskDetailsView.as::get hintButton()
    private get hintButton(): IInteractiveWindow | null
    {
        return (this._window?.findChildByName('hint_redirect_btn') ?? null) as unknown as IInteractiveWindow | null;
    }

    // AS3: RewardTrackTaskDetailsView.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        (this.hintButton as unknown as IWindow | null)?.removeEventListener('WME_CLICK', this.onHintClicked);
        (this.taskNameRegion as unknown as IWindow | null)?.removeEventListener('WME_CLICK', this.onTaskNameClicked);

        this.levelsList?.removeListItems();

        for(const view of this._levelViews)
        {
            view.recycle();
        }

        this._levelViews = [];
        this._controller = null;
        this._window = null;
        this._levelTemplate = null;
        this._theme = null;
        this._task = null;
    }
}
