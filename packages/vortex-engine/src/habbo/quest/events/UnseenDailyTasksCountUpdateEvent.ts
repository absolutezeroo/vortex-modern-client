/**
 * How many daily tasks are finished and not yet claimed.
 *
 * Raised by `DailyTasksController` on every change to the task list, and it is what puts the badge
 * on the toolbar's daily-tasks icon. Note "unseen" counts *completed* tasks, not new ones: a task
 * the player has not looked at but has not finished either does not appear here.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/events/UnseenDailyTasksCountUpdateEvent.as
 */
export class UnseenDailyTasksCountUpdateEvent
{
    // AS3: UnseenDailyTasksCountUpdateEvent.as::TYPE
    public static readonly TYPE: string = 'qe_udtcue';

    // AS3: UnseenDailyTasksCountUpdateEvent.as::_count
    private _count: number;

    // AS3: UnseenDailyTasksCountUpdateEvent.as::UnseenDailyTasksCountUpdateEvent()
    constructor(count: number)
    {
        this._count = count;
    }

    // AS3: UnseenDailyTasksCountUpdateEvent.as::get count()
    get count(): number
    {
        return this._count;
    }
}
