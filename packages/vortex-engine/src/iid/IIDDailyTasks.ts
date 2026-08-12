import {createIID} from '@core/runtime/IID';
import type {IDailyTasksController} from '@habbo/quest/dailytasks/IDailyTasksController';

/**
 * IID for the Daily Tasks controller.
 *
 * `HabboQuestEngine` attaches `DailyTasksController` under this, exactly as AS3 does.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/iid/IIDDailyTasks.as
 */
export const IID_DailyTasks = createIID<IDailyTasksController>('IDailyTasks');
