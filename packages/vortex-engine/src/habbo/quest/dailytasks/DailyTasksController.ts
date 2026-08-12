import {Component} from '@core/runtime/Component';
import {ComponentDependency} from '@core/runtime/ComponentDependency';
import type {IContext} from '@core/runtime/IContext';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import {Logger} from '@core/utils/Logger';

import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import {DailyTaskData} from '@habbo/communication/messages/parser/quest/DailyTaskData';
import type {DailyTasksActiveListMessageEventParser} from '@habbo/communication/messages/parser/quest/DailyTasksActiveListMessageEventParser';
import type {DailyTasksTasksAddedMessageEventParser} from '@habbo/communication/messages/parser/quest/DailyTasksTasksAddedMessageEventParser';
import type {DailyTasksTaskUpdateMessageEventParser} from '@habbo/communication/messages/parser/quest/DailyTasksTaskUpdateMessageEventParser';
import {DailyTasksActiveListMessageEvent} from '@habbo/communication/messages/incoming/quest/DailyTasksActiveListMessageEvent';
import {DailyTasksTasksAddedMessageEvent} from '@habbo/communication/messages/incoming/quest/DailyTasksTasksAddedMessageEvent';
import {DailyTasksTaskUpdateMessageEvent} from '@habbo/communication/messages/incoming/quest/DailyTasksTaskUpdateMessageEvent';
import {GetDailyTasksComposer} from '@habbo/communication/messages/outgoing/users/GetDailyTasksComposer';
import {ClaimDailyTaskComposer} from '@habbo/communication/messages/outgoing/quest/ClaimDailyTaskComposer';

import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';

import type {HabboQuestEngine} from '../HabboQuestEngine';
import {UnseenDailyTasksCountUpdateEvent} from '../events/UnseenDailyTasksCountUpdateEvent';
import type {IDailyTasksController} from './IDailyTasksController';
import {DailyTasksView} from './DailyTasksView';

const log = Logger.getLogger('habbo.quest.dailytasks.DailyTasksController');

// AS3: DailyTasksController.as::REQUEST_TASKS_TIMEOUT_MS
const REQUEST_TASKS_TIMEOUT_MS = 10000;

/**
 * The daily-tasks board: holds the active tasks, keeps the toolbar's unclaimed badge in step, and
 * sends the two requests the server answers.
 *
 * Three server messages were already registered in `HabboMessages` (1824, 2506, 1065) with nothing
 * subscribed to them — the board arrived every session and was dropped on the floor. This class is
 * the subscriber.
 *
 * The board window and its four child views are ported too, so `viewExists()` is a real check
 * again rather than a constant false.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/dailytasks/DailyTasksController.as
 */
export class DailyTasksController extends Component implements IDailyTasksController, ILinkEventTracker
{
    // AS3: DailyTasksController.as::_questEngine
    private _questEngine: HabboQuestEngine;
    // AS3: DailyTasksController.as::_communicationManager
    private _communicationManager: IHabboCommunicationManager | null = null;
    // AS3: DailyTasksController.as::_localizationManager
    private _localizationManager: IHabboLocalizationManager | null = null;
    // AS3: DailyTasksController.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;
    // AS3: DailyTasksController.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];
    // AS3: DailyTasksController.as::_SafeStr_5990 (from `get tasks()`)
    private _tasks: DailyTaskData[] = [];

    /**
     * Tasks that arrived already lapsed but still completed.
     *
     * **This field is a live crash in the Flash client, and the `= []` here is what removes it.**
     * AS3 declares it `private var _SafeStr_10392:Vector.<_SafeCls_2991>;` with no initialiser, and
     * the constructor — which does initialise `_SafeStr_5990` and `_messageEvents` on the two lines
     * either side — never assigns it. An uninitialised Vector is `null` in AS3, so `addTask()`'s
     * `_SafeStr_10392.push(param1)` throws TypeError #1009 for the first task that arrives expired
     * *and* completed, aborting `onActiveDailyTasks()` mid-loop and leaving the rest of the board
     * unloaded.
     *
     * Nothing reads the list — not here, not in the views, nowhere in the tree — so the only effect
     * it ever had was that crash. Initialising it keeps `addTask()`'s branch faithful while making
     * it harmless, which is the one reading of "port it" that is not either a crash or a silent
     * deletion of AS3 behaviour.
     */
    // AS3: DailyTasksController.as::_SafeStr_10392 (name DERIVED from the branch that pushes to it)
    private _unclaimedExpiredTasks: DailyTaskData[] = [];

    // AS3: DailyTasksController.as::_SafeStr_4550 (from `get view()`)
    private _view: DailyTasksView | null = null;

    // AS3: DailyTasksController.as::get view()
    get view(): DailyTasksView | null
    {
        return this._view;
    }

    // AS3: DailyTasksController.as::_lastRequestTime
    private _lastRequestTime: number = 0;
    // AS3: DailyTasksController.as::_SafeStr_5769 (the disposed flag)
    private _controllerDisposed: boolean = false;

    /**
     * AS3 subscribes its three events in the *constructor*, before dependencies resolve, so
     * `addMessageEvent()` short-circuits on a null communication manager and the events are lost.
     * They are built here and subscribed in `initComponent()` instead, which is the first point at
     * which the manager exists. Same three events, same handlers — a timing fix, not a behaviour
     * change, and without it this class would repeat the very bug it is here to fix.
     */
    // AS3: DailyTasksController.as::DailyTasksController()
    constructor(
        questEngine: HabboQuestEngine,
        context: IContext,
        flags: number = 0,
        assetLibrary: IAssetLibrary | null = null
    )
    {
        super(context, flags, assetLibrary);

        this._questEngine = questEngine;
    }

    // AS3: DailyTasksController.as::get dependencies()
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) =>
                {
                    this._communicationManager = manager;
                },
                true
            ),
            new ComponentDependency(
                IID_HabboWindowManager,
                (manager: IHabboWindowManager | null) =>
                {
                    this._windowManager = manager;
                }
            ),
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) =>
                {
                    this._localizationManager = manager;
                }
            ),
        ];
    }

    // AS3: DailyTasksController.as::initComponent()
    protected override initComponent(): void
    {
        this.context?.addLinkEventTracker(this);

        this._messageEvents = [
            new DailyTasksActiveListMessageEvent(this.onActiveDailyTasks),
            new DailyTasksTasksAddedMessageEvent(this.onTasksAdded),
            new DailyTasksTaskUpdateMessageEvent(this.onTaskUpdated),
        ];

        for(const event of this._messageEvents) this.addMessageEvent(event);
    }

    // AS3: DailyTasksController.as::get linkPattern()
    get linkPattern(): string
    {
        return 'dailytasks/';
    }

    // AS3: DailyTasksController.as::linkReceived()
    linkReceived(link: string): void
    {
        if(!this.isEnabled) return;

        const parts = link.split('/');

        if(parts.length < 2) return;

        if(parts[1] === 'open') this.showView();
    }

    // AS3: DailyTasksController.as::toggleView()
    toggleView(): void
    {
        if(this.isShowing())
        {
            this.hideView();
        }
        else
        {
            this.showView();
        }
    }

    // AS3: DailyTasksController.as::showView()
    private showView(): void
    {
        if(!this.isEnabled) return;

        if(!this.viewExists())
        {
            if(this._windowManager === null)
            {
                log.warn('No window manager: the daily-tasks board cannot be opened.');

                return;
            }

            this._view = new DailyTasksView(this, this._windowManager);
            this._view.initialize();
        }

        this._view?.show();
    }

    // AS3: DailyTasksController.as::hideView()
    private hideView(): void
    {
        if(!this.viewExists()) return;

        this._view?.hide();
    }

    // AS3: DailyTasksController.as::isShowing()
    private isShowing(): boolean
    {
        return this.viewExists() && this._view!.isShowing();
    }

    // AS3: DailyTasksController.as::viewExists()
    private viewExists(): boolean
    {
        return this._view !== null && !this._view.disposed;
    }

    // AS3: DailyTasksController.as::get isEnabled()
    get isEnabled(): boolean
    {
        return this.getBoolean('dailytasks.enabled');
    }

    // AS3: DailyTasksController.as::clearTasks()
    private clearTasks(): void
    {
        this._tasks = [];

        if(this.viewExists()) this._view!.tasksCleared();
    }

    /**
     * AS3 pushes an already-lapsed but completed task onto the unclaimed list *as well as* the main
     * one — not instead of it, so it appears twice across the two lists by design.
     */
    // AS3: DailyTasksController.as::addTask()
    private addTask(task: DailyTaskData): void
    {
        if(this.getTaskById(task.taskId) !== null) return;

        if(task.secondsLeft < 0 && task.status === DailyTaskData.STATUS_COMPLETED)
        {
            this._unclaimedExpiredTasks.push(task);
        }

        this._tasks.push(task);

        if(this.viewExists()) this._view!.taskAdded(task);
    }

    /**
     * "Unseen" is the count of *completed* tasks, i.e. finished and waiting to be claimed — not
     * tasks the player has not opened. The toolbar badge reads this.
     */
    // AS3: DailyTasksController.as::updateUnseenTasks()
    private updateUnseenTasks(): void
    {
        let count = 0;

        for(const task of this._tasks)
        {
            if(task.status === DailyTaskData.STATUS_COMPLETED) count += 1;
        }

        this._questEngine.events.emit(
            UnseenDailyTasksCountUpdateEvent.TYPE,
            new UnseenDailyTasksCountUpdateEvent(count)
        );
    }

    // AS3: DailyTasksController.as::updateWindowDimensions()
    private updateWindowDimensions(): void
    {
        if(!this.viewExists()) return;

        this._view!.taskAmountChanged();
    }

    /**
     * The full board. Note the two passes: non-bonus tasks are added first and bonus ones second,
     * so the bonus task always sorts last in the list regardless of wire order.
     */
    // AS3: DailyTasksController.as::onActiveDailyTasks()
    private onActiveDailyTasks = (event: IMessageEvent): void =>
    {
        const parser = event.parser as DailyTasksActiveListMessageEventParser | null;

        if(parser === null) return;

        this.clearTasks();

        for(const task of parser.tasks)
        {
            if(!task.isBonus) this.addTask(task);
        }

        for(const task of parser.tasks)
        {
            if(task.isBonus) this.addTask(task);
        }

        this.updateWindowDimensions();
        this.updateUnseenTasks();
    };

    /**
     * AS3 tests only `tasks[0].isBonus` to decide whether to announce a bonus — a batch whose first
     * entry is ordinary announces nothing even if a later one is a bonus. Kept.
     */
    // AS3: DailyTasksController.as::onTasksAdded()
    private onTasksAdded = (event: IMessageEvent): void =>
    {
        const parser = event.parser as DailyTasksTasksAddedMessageEventParser | null;

        if(parser === null) return;

        for(const task of parser.tasks) this.addTask(task);

        if(parser.tasks.length > 0 && parser.tasks[0].isBonus)
        {
            this._questEngine.notifications?.addItem(
                this._localizationManager?.getLocalization('dailytasks.bonus_available') ?? '',
                'info',
                'icon_daily_tasks_png',
                'dailytasks/open'
            );
        }

        this.updateWindowDimensions();
        this.updateUnseenTasks();
    };

    /**
     * A progress tick for one task. An update for a task we do not have re-requests the whole board
     * rather than guessing — which is also the only thing that gets the board back after a
     * reconnect drops it.
     *
     * The notification fires only on a *change* of status, which is why the old value is captured
     * before the assignment.
     */
    // AS3: DailyTasksController.as::onTaskUpdated()
    private onTaskUpdated = (event: IMessageEvent): void =>
    {
        const parser = event.parser as DailyTasksTaskUpdateMessageEventParser | null;

        if(parser === null) return;

        const task = this.getTaskById(parser.taskId);

        if(task === null)
        {
            this.requestTasks();
        }
        else
        {
            const previousStatus = task.status;

            task.repeats = parser.repeats;
            task.status = parser.status;

            if(this.viewExists()) this._view!.taskUpdated(task.taskId);

            if(previousStatus !== task.status)
            {
                if(task.status === DailyTaskData.STATUS_COMPLETED)
                {
                    this._questEngine.notifications?.addItem(
                        this._localizationManager?.getLocalization('dailytasks.completed.caption') ?? '',
                        'info',
                        'icon_daily_tasks_png',
                        'dailytasks/open'
                    );
                }
                else if(task.status === DailyTaskData.STATUS_CLAIMED)
                {
                    this._questEngine.notifications?.addItem(
                        this._localizationManager?.getLocalization('dailytasks.claimed.caption') ?? '',
                        'info',
                        'icon_daily_tasks_png',
                        'dailytasks/open'
                    );
                }
            }
        }

        this.updateUnseenTasks();
    };

    // AS3: DailyTasksController.as::getTaskById()
    getTaskById(taskId: number): DailyTaskData | null
    {
        for(const task of this._tasks)
        {
            if(task.taskId === taskId) return task;
        }

        return null;
    }

    // AS3: DailyTasksController.as::get tasks()
    get tasks(): DailyTaskData[]
    {
        return this._tasks;
    }

    /**
     * Rate-limited to one request per 10 s. AS3 uses `getTimer()` (ms since the player started);
     * `performance.now()` is the same monotonic clock for this purpose — what matters is that it
     * cannot go backwards, which `Date.now()` can.
     */
    // AS3: DailyTasksController.as::requestTasks()
    requestTasks(): void
    {
        const now = performance.now();

        if(now <= this._lastRequestTime + REQUEST_TASKS_TIMEOUT_MS) return;

        this._lastRequestTime = now;
        this.send(new GetDailyTasksComposer());
    }

    // AS3: DailyTasksController.as::claimTask()
    claimTask(taskId: number): void
    {
        this.send(new ClaimDailyTaskComposer(taskId));
    }

    // AS3: DailyTasksController.as::update()
    update(deltaTime: number): void
    {
        if(!this.viewExists()) return;

        this._view!.update(deltaTime);
    }

    // AS3: DailyTasksController.as::send()
    send(composer: IMessageComposer<unknown[]>): void
    {
        this._communicationManager?.connection?.send(composer);
    }

    // AS3: DailyTasksController.as::addMessageEvent()
    addMessageEvent(event: IMessageEvent): void
    {
        if(this._communicationManager === null) return;

        this._communicationManager.addMessageEvent(event);
    }

    // AS3: DailyTasksController.as::removeMessageEvent()
    removeMessageEvent(event: IMessageEvent): void
    {
        if(this._communicationManager === null) return;

        this._communicationManager.removeMessageEvent(event);
    }

    // AS3: DailyTasksController.as::get localizationManager()
    get localizationManager(): IHabboLocalizationManager | null
    {
        return this._localizationManager;
    }

    // AS3: DailyTasksController.as::get windowManager()
    get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: DailyTasksController.as::get questEngine()
    get questEngine(): HabboQuestEngine
    {
        return this._questEngine;
    }

    // AS3: DailyTasksController.as::get disposed()
    override get disposed(): boolean
    {
        return this._controllerDisposed;
    }

    // AS3: DailyTasksController.as::dispose()
    override dispose(): void
    {
        if(this._controllerDisposed) return;

        this._controllerDisposed = true;

        if(this._view !== null)
        {
            this._view.dispose();
            this._view = null;
        }

        for(const event of this._messageEvents) this.removeMessageEvent(event);

        this._messageEvents = [];
        this._communicationManager = null;
        this._windowManager = null;
        this._localizationManager = null;

        super.dispose();
    }
}
