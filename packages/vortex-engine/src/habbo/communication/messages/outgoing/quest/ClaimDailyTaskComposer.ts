import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Claims one finished daily task (WIN63 header 4101).
 *
 * The task id is a **long** everywhere it is read — `DailyTaskData.taskId` and the task-update
 * parser both use `readLong()` — but AS3's composer declares `param1:int` and pushes it as one, so
 * the claim goes out narrowed to 32 bits. Kept: the wire format is what the server parses.
 *
 * Name RECOVERED from sources/win63_version/habbo/communication/messages/outgoing/quest/ClaimDailyTaskComposer.as
 * — that tree is obfuscated too, but it is the one where messages keep readable filenames.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1781/_SafeCls_2610.as
 */
export class ClaimDailyTaskComposer extends MessageComposer<[number]>
{
    // AS3: _SafeCls_2610.as::_SafeStr_4642
    private _data: [number];

    // AS3: _SafeCls_2610.as::_SafeCls_2610()
    constructor(taskId: number)
    {
        super();

        this._data = [taskId | 0];
    }

    // AS3: _SafeCls_2610.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
