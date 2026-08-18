/**
 * RewardTrackTaskListView — the task half of the window: three filter pills, the filtered list, and
 * the details panel it drives.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/view/tasks/RewardTrackTaskListView.as
 *
 * Every row is built once, up front, and **filtering only changes which rows are in the list
 * window** — `applyFilter()` empties it and re-adds the matches. That is why `getRowView()` searches
 * `_rowViews` rather than the list.
 *
 * Two details worth keeping in mind:
 *
 * - **The selection is repaired by the filter**, not by the caller. If the selected task falls out
 *   of the current filter, `applyFilter()` selects the first match instead, or clears both the
 *   selection and the details panel when nothing matches.
 * - **`taskProgressUpdated()` only re-filters when membership actually changed.** It is handed the
 *   task's `hasProgress`/`isComplete` from *before* the update and compares — so a task ticking up
 *   inside the same filter bucket does not reshuffle the list under the reader.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IScrollableListWindow} from '@core/window/components/IScrollableListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IInteractiveWindow} from '@core/window/components/IInteractiveWindow';
import type {RewardTrack} from '../../data/RewardTrack';
import type {RewardTrackTask} from '../../data/RewardTrackTask';
import type {RewardTrackController} from '../../RewardTrackController';
import type {RewardTrackTheme} from '../theme/RewardTrackTheme';
import {RewardTrackTaskFilter} from './RewardTrackTaskFilter';
import {RewardTrackTaskFilterButtonView} from './RewardTrackTaskFilterButtonView';
import {RewardTrackTaskRowView} from './RewardTrackTaskRowView';
import type {RewardTrackTaskDetailsView} from './RewardTrackTaskDetailsView';

export class RewardTrackTaskListView
{
    /** Derived name — `_SafeStr_4593`. */
    // AS3: RewardTrackTaskListView.as::_SafeStr_4593
    private _controller: RewardTrackController | null;

    // AS3: RewardTrackTaskListView.as::_window
    private _window: IWindowContainer | null;

    /** Derived name — `_SafeStr_6979`: the row template. */
    // AS3: RewardTrackTaskListView.as::_SafeStr_6979
    private _rowTemplate: IWindowContainer | null;

    /** Derived name — `_SafeStr_5903`. */
    // AS3: RewardTrackTaskListView.as::_SafeStr_5903
    private _detailsView: RewardTrackTaskDetailsView | null;

    /** Derived name — `_SafeStr_4821`. */
    // AS3: RewardTrackTaskListView.as::_SafeStr_4821
    private _track: RewardTrack | null;

    // AS3: RewardTrackTaskListView.as::_theme
    private _theme: RewardTrackTheme | null;

    /** Derived name — `_SafeStr_4691`: the active filter. */
    // AS3: RewardTrackTaskListView.as::_SafeStr_4691
    private _filter: number = RewardTrackTaskFilter.ALL;

    /** Derived name — `_SafeStr_5628`. */
    // AS3: RewardTrackTaskListView.as::_SafeStr_5628
    private _filterButtons: RewardTrackTaskFilterButtonView[] = [];

    /** Derived name — `_SafeStr_5680`. */
    // AS3: RewardTrackTaskListView.as::_SafeStr_5680
    private _rowViews: RewardTrackTaskRowView[] = [];

    /** Derived name — `_SafeStr_5002`: the selected task. */
    // AS3: RewardTrackTaskListView.as::_SafeStr_5002
    private _selectedTask: RewardTrackTask | null = null;

    /** Derived name — `_SafeStr_8204`: whether the last refresh animated, carried into selection. */
    // AS3: RewardTrackTaskListView.as::_SafeStr_8204
    private _animate: boolean = false;

    // AS3: RewardTrackTaskListView.as::_disposed
    private _disposed: boolean = false;

    // AS3: RewardTrackTaskListView.as::RewardTrackTaskListView()
    constructor(
        controller: RewardTrackController,
        window: IWindowContainer,
        rowTemplate: IWindowContainer,
        detailsView: RewardTrackTaskDetailsView,
        track: RewardTrack,
        theme: RewardTrackTheme
    )
    {
        this._controller = controller;
        this._window = window;
        this._rowTemplate = rowTemplate;
        this._detailsView = detailsView;
        this._track = track;
        this._theme = theme;

        (this.getPremiumButton as unknown as IWindow | null)
            ?.addEventListener('WME_CLICK', this.onGetPremiumClicked);

        this.initializeFilters();
        this.initializeTasks();
    }

    /**
     * The three pills come out of the layout in order and are re-added wrapped — AS3 pops index 0
     * three times rather than naming them.
     */
    // AS3: RewardTrackTaskListView.as::initializeFilters()
    private initializeFilters(): void
    {
        const tabs = this.tabSelection;

        if(tabs === null || this._theme === null) return;

        const all = tabs.removeListItemAt(0) as unknown as IRegionWindow | null;
        const inProgress = tabs.removeListItemAt(0) as unknown as IRegionWindow | null;
        const completed = tabs.removeListItemAt(0) as unknown as IRegionWindow | null;

        const specs: Array<[IRegionWindow | null, number, string]> = [
            [all, RewardTrackTaskFilter.ALL, 'reward_track.tasks.tab.all_tasks'],
            [inProgress, RewardTrackTaskFilter.IN_PROGRESS, 'reward_track.tasks.tab.in_progress'],
            [completed, RewardTrackTaskFilter.COMPLETED, 'reward_track.tasks.tab.completed']
        ];

        for(const [region, filter, key] of specs)
        {
            if(region === null) continue;

            this._filterButtons.push(
                new RewardTrackTaskFilterButtonView(region, filter, key, this, this._theme)
            );
        }

        for(const button of this._filterButtons)
        {
            if(button.window !== null) tabs.addListItem(button.window as unknown as IWindow);
        }

        this.refreshFilterButtons();
    }

    // AS3: RewardTrackTaskListView.as::initializeTasks()
    private initializeTasks(): void
    {
        if(this._track === null || this._rowTemplate === null || this._controller === null
            || this._theme === null)
        {
            return;
        }

        for(const task of this._track.tasks)
        {
            this._rowViews.push(
                new RewardTrackTaskRowView(this._rowTemplate, this._controller, this, task, this._theme)
            );
        }

        this.applyFilter();
        this.refresh(false);
    }

    // AS3: RewardTrackTaskListView.as::setFilter()
    public setFilter(filter: number): void
    {
        if(this._filter === filter) return;

        this._filter = filter;

        this.refreshFilterButtons();
        this.applyFilter();
    }

    // AS3: RewardTrackTaskListView.as::selectTask()
    public selectTask(task: RewardTrackTask): void
    {
        if(this._selectedTask !== null && this._selectedTask !== task)
        {
            this.getRowView(this._selectedTask)?.setSelected(false);
        }

        this._selectedTask = task;

        this.getRowView(task)?.setSelected(true);

        this._detailsView?.selectTask(task, this._animate);
    }

    // AS3: RewardTrackTaskListView.as::refresh()
    public refresh(animate: boolean): void
    {
        this._animate = animate;

        this.refreshTasksCompletion();
        this.refreshPremiumInfo();

        for(const row of this._rowViews)
        {
            row.refresh(animate);
        }

        if(this._selectedTask !== null)
        {
            this._detailsView?.refresh(animate);
        }

        this.applyFilter();
    }

    /** `hadProgress`/`wasComplete` are the task's state *before* the update — see the class note. */
    // AS3: RewardTrackTaskListView.as::taskProgressUpdated()
    public taskProgressUpdated(
        task: RewardTrackTask,
        hadProgress: boolean,
        wasComplete: boolean,
        animate: boolean
    ): void
    {
        this._animate = animate;

        this.getRowView(task)?.refresh(animate);

        if(wasComplete !== task.isComplete)
        {
            this.refreshTasksCompletion();
        }

        if(this.hasFilterMembershipChanged(task, hadProgress, wasComplete))
        {
            this.applyFilter();
        }

        if(this._selectedTask === task)
        {
            this._detailsView?.refresh(animate);
        }
    }

    // AS3: RewardTrackTaskListView.as::premiumUpdated()
    public premiumUpdated(): void
    {
        this.refreshPremiumInfo();
    }

    // AS3: RewardTrackTaskListView.as::update()
    public update(deltaMs: number): void
    {
        for(const row of this._rowViews)
        {
            row.update(deltaMs);
        }

        this._detailsView?.update(deltaMs);
    }

    // AS3: RewardTrackTaskListView.as::applyFilter()
    private applyFilter(): void
    {
        const list = this.tasksList;

        list?.removeListItems();

        let firstMatch: RewardTrackTask | null = null;

        for(const row of this._rowViews)
        {
            if(row.task === null || !this.matchesFilter(row.task)) continue;

            if(row.window !== null) list?.addListItem(row.window as unknown as IWindow);

            if(firstMatch === null) firstMatch = row.task;
        }

        if(this._selectedTask === null || !this.matchesFilter(this._selectedTask))
        {
            if(firstMatch !== null)
            {
                this.selectTask(firstMatch);
            }
            else
            {
                this.clearSelectedTask();
                this._detailsView?.clear();
            }
        }
    }

    // AS3: RewardTrackTaskListView.as::clearSelectedTask()
    private clearSelectedTask(): void
    {
        if(this._selectedTask !== null)
        {
            this.getRowView(this._selectedTask)?.setSelected(false);
        }

        this._selectedTask = null;
    }

    // AS3: RewardTrackTaskListView.as::matchesFilter()
    private matchesFilter(task: RewardTrackTask): boolean
    {
        if(this._filter === RewardTrackTaskFilter.IN_PROGRESS)
        {
            return task.hasProgress && !task.isComplete;
        }

        if(this._filter === RewardTrackTaskFilter.COMPLETED)
        {
            return task.isComplete;
        }

        return true;
    }

    // AS3: RewardTrackTaskListView.as::hasFilterMembershipChanged()
    private hasFilterMembershipChanged(
        task: RewardTrackTask,
        hadProgress: boolean,
        wasComplete: boolean
    ): boolean
    {
        if(this._filter === RewardTrackTaskFilter.IN_PROGRESS)
        {
            return hadProgress !== task.hasProgress || wasComplete !== task.isComplete;
        }

        if(this._filter === RewardTrackTaskFilter.COMPLETED)
        {
            return wasComplete !== task.isComplete;
        }

        return false;
    }

    // AS3: RewardTrackTaskListView.as::getRowView()
    private getRowView(task: RewardTrackTask): RewardTrackTaskRowView | null
    {
        for(const row of this._rowViews)
        {
            if(row.task === task)
            {
                return row;
            }
        }

        return null;
    }

    // AS3: RewardTrackTaskListView.as::refreshTasksCompletion()
    private refreshTasksCompletion(): void
    {
        const text = this.tasksCompletionText;

        if(text === null) return;

        text.text = this._controller?.localizationManager?.getLocalizationWithParams(
            'reward_track.tasks.progress',
            '',
            'progress', String(this._track?.completedTaskCount ?? 0),
            'total', String(this._track?.totalTaskCount ?? 0)
        ) ?? '';
    }

    /** A track with no premium tier shows the ordinary info panel, same as one already bought. */
    // AS3: RewardTrackTaskListView.as::refreshPremiumInfo()
    private refreshPremiumInfo(): void
    {
        const track = this._track;

        if(track === null) return;

        const info = this.rewardInfo as unknown as IWindow | null;
        const notPremium = this.rewardInfoNotPremium as unknown as IWindow | null;

        if(info !== null) info.visible = !track.hasPremiumConfig || track.premium;
        if(notPremium !== null) notPremium.visible = track.hasPremiumConfig && !track.premium;
    }

    // AS3: RewardTrackTaskListView.as::refreshFilterButtons()
    private refreshFilterButtons(): void
    {
        const active = this._filterButtons[this._filter] ?? null;

        for(const button of this._filterButtons)
        {
            button.setActive(active !== null && button.window === active.window);
        }
    }

    // AS3: RewardTrackTaskListView.as::onGetPremiumClicked()
    private onGetPremiumClicked = (): void =>
    {
        if(this._track !== null) this._controller?.openPremiumPurchaseConfirmation(this._track);
    };

    // AS3: RewardTrackTaskListView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: RewardTrackTaskListView.as::get tasksCompletionText()
    private get tasksCompletionText(): ITextWindow | null
    {
        return (this._window?.findChildByName('tasks_completion_txt') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackTaskListView.as::get tabSelection()
    private get tabSelection(): IItemListWindow | null
    {
        return (this._window?.findChildByName('tab_selection') ?? null) as unknown as IItemListWindow | null;
    }

    // AS3: RewardTrackTaskListView.as::get tasksList()
    private get tasksList(): IScrollableListWindow | null
    {
        return (this._window?.findChildByName('tasks') ?? null) as unknown as IScrollableListWindow | null;
    }

    // AS3: RewardTrackTaskListView.as::get rewardInfo()
    private get rewardInfo(): IWindowContainer | null
    {
        return (this._window?.findChildByName('reward_info') ?? null) as IWindowContainer | null;
    }

    // AS3: RewardTrackTaskListView.as::get rewardInfoNotPremium()
    private get rewardInfoNotPremium(): IWindowContainer | null
    {
        return (this._window?.findChildByName('reward_info_not_premium') ?? null) as IWindowContainer | null;
    }

    // AS3: RewardTrackTaskListView.as::get getPremiumButton()
    private get getPremiumButton(): IInteractiveWindow | null
    {
        return (this._window?.findChildByName('get_premium_btn') ?? null) as unknown as IInteractiveWindow | null;
    }

    // AS3: RewardTrackTaskListView.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        (this.getPremiumButton as unknown as IWindow | null)
            ?.removeEventListener('WME_CLICK', this.onGetPremiumClicked);

        this.tasksList?.removeListItems();

        for(const row of this._rowViews)
        {
            row.dispose();
        }

        for(const button of this._filterButtons)
        {
            button.dispose();
        }

        this._rowViews = [];
        this._filterButtons = [];
        this._controller = null;
        this._window = null;
        this._rowTemplate = null;
        this._detailsView = null;
        this._track = null;
        this._theme = null;
        this._selectedTask = null;
    }
}
