import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IScrollableListWindow} from '@core/window/components/IScrollableListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {DailyTaskData} from '@habbo/communication/messages/parser/quest/DailyTaskData';
import {FriendlyTime} from '@habbo/utils/FriendlyTime';

import type {DailyTasksController} from './DailyTasksController';
import {DailyTaskView} from './tasks/DailyTaskView';
import {UnclaimedTasksView} from './UnclaimedTasksView';

/**
 * The daily-tasks board.
 *
 * Two templates are *detached* from the layout in the constructor and cloned per row afterwards —
 * the task row, and the reward chip nested inside it. `removeListItemAt(0)` is what takes them out,
 * so the layout's first list entry is a prototype rather than a real item; forgetting that would
 * leave a blank row at the top of every list.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/dailytasks/DailyTasksView.as
 */
export class DailyTasksView
{
    // AS3: DailyTasksView.as::_SafeStr_11637 (name DERIVED: the only use is the title-refresh throttle)
    private static readonly TITLE_UPDATE_INTERVAL_MS = 500;

    // AS3: DailyTasksView.as::DESKTOP_WINDOW_LAYER
    public static readonly DESKTOP_WINDOW_LAYER = 1;

    // AS3: DailyTasksView.as::_windowManager
    private _windowManager: IHabboWindowManager | null;
    // AS3: DailyTasksView.as::_SafeStr_4593 (the controller)
    private _controller: DailyTasksController | null;
    // AS3: DailyTasksView.as::_window
    private _window: IWindowContainer | null = null;
    // AS3: DailyTasksView.as::_SafeStr_6979 (from `get taskTemplate()`)
    private _taskTemplate: IWindowContainer | null = null;
    // AS3: DailyTasksView.as::_SafeStr_7033 (from `get rewardTemplate()`)
    private _rewardTemplate: IWindowContainer | null = null;
    // AS3: DailyTasksView.as::_SafeStr_5362 (the task rows)
    private _taskViews: DailyTaskView[] = [];
    // AS3: DailyTasksView.as::_lastTitleUpdateTime
    private _lastTitleUpdateTime: number = 0;
    // AS3: DailyTasksView.as::_SafeStr_5758
    private _unclaimedView: UnclaimedTasksView | null = null;
    // AS3: DailyTasksView.as::_SafeStr_5769 (the disposed flag)
    private _disposed: boolean = false;

    // AS3: DailyTasksView.as::DailyTasksView()
    constructor(controller: DailyTasksController, windowManager: IHabboWindowManager)
    {
        this._controller = controller;
        this._windowManager = windowManager;

        // AS3 reads the layout via `assets.getAssetByName(...).content` + `buildFromXML(xml, 1)`;
        // `buildWidgetLayout()` is those two steps behind one call, layer included.
        this._window = windowManager.buildWidgetLayout('daily_tasks_xml', DailyTasksView.DESKTOP_WINDOW_LAYER) as IWindowContainer | null;

        if(this._window === null) return;

        this.closeButton?.addEventListener(WindowMouseEvent.CLICK, this.onWindowClose as unknown as (...args: unknown[]) => void);
        this.unclaimedButton?.addEventListener(WindowMouseEvent.CLICK, this.onUnclaimedTasksOpen as unknown as (...args: unknown[]) => void);
        this.getHCButton?.addEventListener(WindowMouseEvent.CLICK, this.onGetHcClicked as unknown as (...args: unknown[]) => void);

        // See the class note: both of these come *out* of the layout and are cloned per row.
        this._taskTemplate = this.tasksList?.removeListItemAt(0) as IWindowContainer | null ?? null;

        const rewardsList = this._taskTemplate?.findChildByName('rewards_list') as IItemListWindow | null ?? null;

        this._rewardTemplate = rewardsList?.removeListItemAt(0) as IWindowContainer | null ?? null;

        this._unclaimedView = new UnclaimedTasksView(controller, windowManager);
    }

    // AS3: DailyTasksView.as::initialize()
    initialize(): void
    {
        for(const task of this._controller?.tasks ?? []) this.taskAdded(task);

        this.taskAmountChanged();
    }

    // AS3: DailyTasksView.as::show()
    show(): void
    {
        if(this._windowManager === null || this._window === null || this._window.parent !== null) return;

        const desktop = this._windowManager.getDesktop(DailyTasksView.DESKTOP_WINDOW_LAYER) as IWindowContainer | null;

        desktop?.addChild(this._window);
    }

    // AS3: DailyTasksView.as::isShowing()
    isShowing(): boolean
    {
        return this._windowManager !== null && this._window !== null && this._window.parent !== null;
    }

    // AS3: DailyTasksView.as::hide()
    hide(): void
    {
        if(!this.isShowing() || this._windowManager === null || this._window === null) return;

        const desktop = this._windowManager.getDesktop(DailyTasksView.DESKTOP_WINDOW_LAYER) as IWindowContainer | null;

        desktop?.removeChild(this._window);
    }

    // AS3: DailyTasksView.as::onWindowClose()
    private onWindowClose = (event: {type: string}): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this.hide();
    };

    // AS3: DailyTasksView.as::onUnclaimedTasksOpen()
    private onUnclaimedTasksOpen = (): void =>
    {
        this._unclaimedView?.show();
    };

    // AS3: DailyTasksView.as::onGetHcClicked()
    private onGetHcClicked = (): void =>
    {
        this._controller?.questEngine.catalog?.openCatalogPage('hc_membership', 'NORMAL');
    };

    /**
     * Re-lays the whole window: the unclaimed strip only appears when it has content, the task list
     * grows to at most four rows before scrolling, and the window widens to its max only once a
     * scrollbar is actually visible.
     *
     * The `33` is AS3's literal — the title bar's height, spelled as a number there too.
     */
    // AS3: DailyTasksView.as::taskAmountChanged()
    taskAmountChanged(): void
    {
        if(this._window === null) return;

        const extra = this.extraCont;
        const list = this.tasksList;
        const main = this.mainContainer;
        const hcBar = this.hcInfoBar;
        const template = this._taskTemplate;

        if(list === null || main === null || template === null) return;

        const hasUnclaimed = (this._unclaimedView?.taskViews.length ?? 0) > 0;

        if(extra !== null) extra.visible = hasUnclaimed;

        const extraHeight = hasUnclaimed && extra !== null ? extra.height + main.spacing : 0;

        list.y = extraHeight;
        list.height = Math.min(Math.max(this._taskViews.length, 1), 4) * (template.height + list.spacing) - list.spacing;

        if(hcBar !== null) hcBar.y = extraHeight + list.height + main.spacing;

        this._window.height = 33 + extraHeight + list.height + main.spacing + (hcBar?.height ?? 0) + main.spacing;
        this._window.width = list.isScrollBarVisible ? this._window.limits.maxWidth : this._window.limits.minWidth;

        if(extra !== null) extra.width = this._window.width;
        if(hcBar !== null) hcBar.width = this._window.width;

        this.setHcDoubleDuckets();
    }

    // AS3: DailyTasksView.as::setHcDoubleDuckets()
    private setHcDoubleDuckets(): void
    {
        const hasClub = this._controller?.questEngine.sessionDataManager?.hasClub ?? false;
        const text = this.hcDoubleDucketsInfoText;
        const localization = this._controller?.localizationManager ?? null;

        if(text !== null)
        {
            text.text = hasClub
                ? localization?.getLocalization('hc.has.double_duckets.info', 'You get double duckets as you are an HC member!') ?? ''
                : localization?.getLocalization('hc.get.double_duckets.info', 'Get HC membership to gain double duckets!') ?? '';
        }

        const button = this.getHCButton;

        if(button !== null) button.visible = !hasClub;
    }

    // AS3: DailyTasksView.as::tasksCleared()
    tasksCleared(): void
    {
        this.tasksList?.removeListItems();

        for(const view of this._taskViews) view.dispose();

        this._taskViews = [];
        this._unclaimedView?.tasksCleared();
    }

    /** An already-lapsed task goes to the unclaimed window instead of the main list. */
    // AS3: DailyTasksView.as::taskAdded()
    taskAdded(task: DailyTaskData): void
    {
        if(task.isExpired)
        {
            this._unclaimedView?.taskAdded(task);

            return;
        }

        const controller = this._controller;

        if(controller === null || this._taskTemplate === null) return;

        const view = new DailyTaskView(task, controller, this._taskTemplate, this._rewardTemplate);

        this._taskViews.push(view);

        if(view.window !== null) this.tasksList?.addListItem(view.window);
    }

    /** A task this view does not hold is forwarded to the unclaimed one before giving up. */
    // AS3: DailyTasksView.as::taskUpdated()
    taskUpdated(taskId: number): void
    {
        const view = this.getTaskViewById(taskId);

        if(view === null)
        {
            this._unclaimedView?.taskUpdated(taskId);

            return;
        }

        view.updateStatusAndRepeatsUI();
    }

    // AS3: DailyTasksView.as::getTaskViewById()
    getTaskViewById(taskId: number): DailyTaskView | null
    {
        for(const view of this._taskViews)
        {
            if(view.dailyTask?.taskId === taskId) return view;
        }

        return null;
    }

    /**
     * Per-frame. Three jobs: tick every row's progress bar, retitle the window with a countdown to
     * the next refresh (throttled to twice a second), and — the important one — *re-request the
     * board* when it is empty or more than five seconds past due. That last line is what recovers
     * the list after a reconnect; the controller's own 10 s rate limit keeps it from flooding.
     */
    // AS3: DailyTasksView.as::update()
    update(elapsedMs: number): void
    {
        for(const view of this._taskViews) view.update(elapsedMs);

        let longestSecondsLeft = 0;

        for(const task of this._controller?.tasks ?? [])
        {
            if(task.secondsLeft > longestSecondsLeft) longestSecondsLeft = task.secondsLeft;
        }

        const now = performance.now();
        const mayRetitle = now > this._lastTitleUpdateTime + DailyTasksView.TITLE_UPDATE_INTERVAL_MS;

        if(this.isShowing() && mayRetitle && this._window !== null)
        {
            const localization = this._controller?.localizationManager ?? null;
            const title = localization?.getLocalization('dailytasks.title') ?? '';

            if(longestSecondsLeft > 0)
            {
                const refreshes = localization?.getLocalizationWithParams(
                    'dailytasks.refreshes',
                    'Refresh in %time',
                    'time', FriendlyTime.getFriendlyTime(localization, longestSecondsLeft)
                ) ?? '';

                this._window.caption = `${title} - ${refreshes}`;
            }
            else
            {
                this._window.caption = title;
            }

            this._lastTitleUpdateTime = now;
        }

        if((this._controller?.tasks.length ?? 0) === 0 || longestSecondsLeft < -5)
        {
            this._controller?.requestTasks();
        }
    }

    // AS3: DailyTasksView.as::get taskTemplate()
    get taskTemplate(): IWindowContainer | null
    {
        return this._taskTemplate;
    }

    // AS3: DailyTasksView.as::get rewardTemplate()
    get rewardTemplate(): IWindowContainer | null
    {
        return this._rewardTemplate;
    }

    // AS3: DailyTasksView.as::get closeButton()
    private get closeButton(): IWindow | null
    {
        return this._window?.findChildByName('header_button_close') ?? null;
    }

    // AS3: DailyTasksView.as::get unclaimedButton()
    private get unclaimedButton(): IWindow | null
    {
        return this._window?.findChildByName('unclaimed_btn') ?? null;
    }

    // AS3: DailyTasksView.as::get tasksList()
    private get tasksList(): IScrollableListWindow | null
    {
        return this._window?.findChildByName('tasks_list') as IScrollableListWindow | null ?? null;
    }

    // AS3: DailyTasksView.as::get mainContainer()
    private get mainContainer(): IItemListWindow | null
    {
        return this._window?.findChildByName('main_cont') as IItemListWindow | null ?? null;
    }

    // AS3: DailyTasksView.as::get extraCont()
    private get extraCont(): IWindowContainer | null
    {
        return this._window?.findChildByName('extra_cont') as IWindowContainer | null ?? null;
    }

    // AS3: DailyTasksView.as::get hcInfoBar()
    private get hcInfoBar(): IWindowContainer | null
    {
        return this._window?.findChildByName('hc_info_cont') as IWindowContainer | null ?? null;
    }

    // AS3: DailyTasksView.as::get hcDoubleDucketsInfoText()
    private get hcDoubleDucketsInfoText(): ITextWindow | null
    {
        return this._window?.findChildByName('hc_info_text') as ITextWindow | null ?? null;
    }

    // AS3: DailyTasksView.as::get getHCButton()
    private get getHCButton(): IWindow | null
    {
        return this._window?.findChildByName('get_hc_btn') ?? null;
    }

    // AS3: DailyTasksView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: DailyTasksView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._unclaimedView?.dispose();
        this._unclaimedView = null;

        for(const view of this._taskViews) view.dispose();

        this._taskViews = [];
        this._taskTemplate = null;
        this._rewardTemplate = null;

        this.hide();

        this.closeButton?.removeEventListener(WindowMouseEvent.CLICK, this.onWindowClose as unknown as (...args: unknown[]) => void);
        this.unclaimedButton?.removeEventListener(WindowMouseEvent.CLICK, this.onUnclaimedTasksOpen as unknown as (...args: unknown[]) => void);
        this.getHCButton?.removeEventListener(WindowMouseEvent.CLICK, this.onGetHcClicked as unknown as (...args: unknown[]) => void);

        this._window?.dispose();
        this._window = null;
        this._disposed = true;
    }
}
