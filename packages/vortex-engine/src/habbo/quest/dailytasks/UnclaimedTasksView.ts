import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IScrollableListWindow} from '@core/window/components/IScrollableListWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {DailyTaskData} from '@habbo/communication/messages/parser/quest/DailyTaskData';

import type {DailyTasksController} from './DailyTasksController';
import {DailyTaskView} from './tasks/DailyTaskView';

// AS3: DailyTasksView.as::DESKTOP_WINDOW_LAYER — the same layer both daily-task windows live on.
const DESKTOP_WINDOW_LAYER = 1;

/**
 * The secondary window listing tasks that lapsed before they were claimed.
 *
 * Built and immediately shown-then-hidden in the constructor: AS3 does `show(); hide();` back to
 * back, which forces one layout pass so the window has real dimensions before anything asks for
 * them. Kept, because `DailyTasksView.taskAmountChanged()` sizes itself off this view's task count
 * and would otherwise measure an unlaid-out window.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/dailytasks/UnclaimedTasksView.as
 */
export class UnclaimedTasksView
{
    // AS3: UnclaimedTasksView.as::_disposed
    private _disposed: boolean = false;
    // AS3: UnclaimedTasksView.as::_windowManager
    private _windowManager: IHabboWindowManager | null;
    // AS3: UnclaimedTasksView.as::_SafeStr_4593 (the controller)
    private _controller: DailyTasksController | null;
    // AS3: UnclaimedTasksView.as::_window
    private _window: IWindowContainer | null = null;
    // AS3: UnclaimedTasksView.as::_SafeStr_5362 (from `get taskViews()`)
    private _taskViews: DailyTaskView[] = [];

    // AS3: UnclaimedTasksView.as::UnclaimedTasksView()
    constructor(controller: DailyTasksController, windowManager: IHabboWindowManager)
    {
        this._controller = controller;
        this._windowManager = windowManager;

        // AS3 reads the layout via `assets.getAssetByName(...).content` + `buildFromXML()`; the
        // port's `buildWidgetLayout()` is those two steps behind one call.
        this._window = windowManager.buildWidgetLayout('dailytasks_unclaimed_xml') as IWindowContainer | null;

        if(this._window === null) return;

        this.closeButton?.addEventListener(WindowMouseEvent.CLICK, this.onWindowClose as unknown as (...args: unknown[]) => void);

        // See the class note: one forced layout pass.
        this.show();
        this.hide();

        const list = this.tasksList;

        if(list !== null) list.autoHideScrollBar = false;
    }

    // AS3: UnclaimedTasksView.as::tasksCleared()
    tasksCleared(): void
    {
        this.tasksList?.removeListItems();

        for(const view of this._taskViews) view.dispose();

        this._taskViews = [];
    }

    // AS3: UnclaimedTasksView.as::taskAdded()
    taskAdded(task: DailyTaskData): void
    {
        const controller = this._controller;
        const template = controller?.view?.taskTemplate ?? null;

        if(controller === null || template === null) return;

        const view = new DailyTaskView(task, controller, template, controller.view?.rewardTemplate ?? null);

        this._taskViews.push(view);

        if(view.window !== null) this.tasksList?.addListItem(view.window);
    }

    // AS3: UnclaimedTasksView.as::taskUpdated()
    taskUpdated(taskId: number): void
    {
        this.getTaskViewById(taskId)?.updateStatusAndRepeatsUI();
    }

    // AS3: UnclaimedTasksView.as::getTaskViewById()
    getTaskViewById(taskId: number): DailyTaskView | null
    {
        for(const view of this._taskViews)
        {
            if(view.dailyTask?.taskId === taskId) return view;
        }

        return null;
    }

    /**
     * AS3 clamps x/y to >= 0 *before* attaching — this window remembers where the player dragged it,
     * and a negative remembered position would put it off-screen.
     */
    // AS3: UnclaimedTasksView.as::show()
    show(): void
    {
        if(this._window === null || this._windowManager === null) return;

        this._window.x = Math.max(this._window.x, 0);
        this._window.y = Math.max(this._window.y, 0);

        if(this._window.parent === null)
        {
            const desktop = this._windowManager.getDesktop(DESKTOP_WINDOW_LAYER) as IWindowContainer | null;

            desktop?.addChild(this._window);
        }

        this._window.activate();
    }

    // AS3: UnclaimedTasksView.as::hide()
    hide(): void
    {
        if(this._window === null || this._windowManager === null || this._window.parent === null) return;

        const desktop = this._windowManager.getDesktop(DESKTOP_WINDOW_LAYER) as IWindowContainer | null;

        desktop?.removeChild(this._window);
    }

    // AS3: UnclaimedTasksView.as::onWindowClose()
    private onWindowClose = (event: {type: string}): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this.hide();
    };

    // AS3: UnclaimedTasksView.as::get taskViews()
    get taskViews(): DailyTaskView[]
    {
        return this._taskViews;
    }

    // AS3: UnclaimedTasksView.as::get closeButton()
    private get closeButton(): IWindow | null
    {
        return this._window?.findChildByName('header_button_close') ?? null;
    }

    // AS3: UnclaimedTasksView.as::get tasksList()
    private get tasksList(): IScrollableListWindow | null
    {
        return this._window?.findChildByName('tasks_list') as IScrollableListWindow | null ?? null;
    }

    // AS3: UnclaimedTasksView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: UnclaimedTasksView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        for(const view of this._taskViews) view.dispose();

        this._taskViews = [];

        this.hide();

        this.closeButton?.removeEventListener(WindowMouseEvent.CLICK, this.onWindowClose as unknown as (...args: unknown[]) => void);

        this._window?.dispose();
        this._window = null;
        this._windowManager = null;
        this._controller = null;
        this._disposed = true;
    }
}
