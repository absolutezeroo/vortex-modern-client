import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {DailyTaskData} from './DailyTaskData';

/**
 * Tasks appended to the ones already held (header 2506) — same wire shape as the active list,
 * a different message because the controller appends instead of replacing, and raises the
 * "bonus task available" notification when the first task in the batch is a bonus one.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_3610.as
 * (class name recovered from
 * sources/win63_version/habbo/communication/messages/parser/quest/DailyTasksTasksAddedMessageEventParser.as)
 */
export class DailyTasksTasksAddedMessageEventParser implements IMessageParser
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_3610.as::tasks
    private _tasks: DailyTaskData[] = [];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_3610.as::flush()
    flush(): boolean
    {
        this._tasks = [];

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_3610.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._tasks = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._tasks.push(new DailyTaskData(wrapper));
        }

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_3610.as::get tasks()
    get tasks(): DailyTaskData[]
    {
        return this._tasks;
    }
}
