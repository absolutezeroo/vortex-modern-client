import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Progress on one already-known daily task (header 1065). Carries only the mutable fields —
 * AS3's controller looks the task up by id and writes `repeats`/`status` back into it, and
 * re-requests the whole list when the id is unknown.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_3575.as
 * (class name recovered from
 * sources/win63_version/habbo/communication/messages/parser/quest/DailyTasksTaskUpdateMessageEventParser.as)
 */
export class DailyTasksTaskUpdateMessageEventParser implements IMessageParser
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_3575.as::taskId
    private _taskId: number = 0;
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_3575.as::repeats
    private _repeats: number = 0;
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_3575.as::status
    private _status: number = 0;
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_3575.as::secondsLeft
    private _secondsLeft: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_3575.as::flush()
    flush(): boolean
    {
        this._taskId = 0;
        this._repeats = 0;
        this._status = 0;
        this._secondsLeft = 0;

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_3575.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._taskId = wrapper.readLong();
        this._repeats = wrapper.readInt();
        this._status = wrapper.readByte();
        this._secondsLeft = wrapper.readInt();

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_3575.as::get taskId()
    get taskId(): number
    {
        return this._taskId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_3575.as::get repeats()
    get repeats(): number
    {
        return this._repeats;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_3575.as::get status()
    get status(): number
    {
        return this._status;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_3575.as::get secondsLeft()
    get secondsLeft(): number
    {
        return this._secondsLeft;
    }
}
