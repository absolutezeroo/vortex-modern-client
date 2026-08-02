import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {DailyTaskData} from './DailyTaskData';

/**
 * The full set of daily tasks currently active for this user (header 1824) — the answer to
 * `GetDailyTasksComposer` (4100).
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_3213.as
 * (class name recovered from
 * sources/win63_version/habbo/communication/messages/parser/quest/DailyTasksActiveListMessageEventParser.as)
 */
export class DailyTasksActiveListMessageEventParser implements IMessageParser
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_3213.as::tasks
    private _tasks: DailyTaskData[] = [];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_3213.as::flush()
    flush(): boolean
    {
        this._tasks = [];

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_3213.as::parse()
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

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_3213.as::get tasks()
    get tasks(): DailyTaskData[]
    {
        return this._tasks;
    }
}
