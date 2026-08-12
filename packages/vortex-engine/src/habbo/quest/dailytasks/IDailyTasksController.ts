import type {IDisposable} from '@core/runtime/IDisposable';
import type {DailyTaskData} from '@habbo/communication/messages/parser/quest/DailyTaskData';

/**
 * The daily-tasks board, as the rest of the client sees it.
 *
 * **AS3's own `_SafeCls_1756` is an empty marker interface** — it declares no members at all, and
 * `DailyTasksController` implements it purely so the IID has something to be typed as. This
 * interface is therefore the port's: it lists the members `HabboQuestEngine` and the views actually
 * call, so `IID_DailyTasks` resolves to something usable rather than to `unknown`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/dailytasks/_SafeCls_1756.as
 * (the empty marker), members from
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/dailytasks/DailyTasksController.as
 */
export interface IDailyTasksController extends IDisposable
{
    // AS3: DailyTasksController.as::get isEnabled()
    readonly isEnabled: boolean;

    // AS3: DailyTasksController.as::get tasks()
    readonly tasks: DailyTaskData[];

    // AS3: DailyTasksController.as::toggleView()
    toggleView(): void;

    // AS3: DailyTasksController.as::requestTasks()
    requestTasks(): void;

    // AS3: DailyTasksController.as::claimTask()
    claimTask(taskId: number): void;

    // AS3: DailyTasksController.as::getTaskById()
    getTaskById(taskId: number): DailyTaskData | null;

    // AS3: DailyTasksController.as::update()
    update(deltaTime: number): void;
}
