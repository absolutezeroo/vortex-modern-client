import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {WiredTransactionInfo} from './WiredTransactionInfo';

/**
 * A page of wired-chest transaction logs, plus which list it is a page of.
 *
 * **Name DERIVED.** The class is `_SafeCls_3374` in the primary tree and exists in no unobfuscated
 * one: `win63_version` predates wired chests entirely (no chest message anywhere in it) and
 * vortex-emulator has no constant for this message either. It is named for what it carries; every
 * *accessor* below, by contrast, kept its real name.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2640/_SafeCls_3374.as
 */
export class WiredTransactionLogList
{
    /**
	 * Which of the two lists this page belongs to. **Both names are derived**, from the only two
	 * call sites that compare against them: the paged transactions window
	 * (`WiredTransactionLogsView`) reads 0, and the chests tab's ten-row preview reads 1. A page of
	 * the wrong type is dropped rather than displayed, so the distinction is load-bearing — two
	 * windows are answered by the same header.
	 */
    // AS3: _SafeCls_3374.as::_SafeStr_10179 (name derived)
    static readonly LOG_LIST_TYPE_FULL: number = 0;

    // AS3: _SafeCls_3374.as::_SafeStr_10358 (name derived)
    static readonly LOG_LIST_TYPE_PREVIEW: number = 1;

    // AS3: _SafeCls_3374.as::logListType
    private _logListType: number = 0;
    // AS3: _SafeCls_3374.as::logListId
    private _logListId: number = 0;
    // AS3: _SafeCls_3374.as::totalLogs
    private _totalLogs: number = 0;
    // AS3: _SafeCls_3374.as::currentPage
    private _currentPage: number = 0;
    // AS3: _SafeCls_3374.as::_amount
    private _amount: number = 0;
    // AS3: _SafeCls_3374.as::logs
    private _logs: WiredTransactionInfo[] = [];
    // AS3: _SafeCls_3374.as::_disposed
    private _disposed: boolean = false;

    // AS3: _SafeCls_3374.as::_SafeCls_3374()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._logListType = wrapper.readInt();
        this._logListId = wrapper.readLong();
        this._totalLogs = wrapper.readInt();
        this._currentPage = wrapper.readInt();
        this._amount = wrapper.readInt();

        const count: number = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._logs.push(new WiredTransactionInfo(wrapper));
        }
    }

    // AS3: _SafeCls_3374.as::get logListType()
    get logListType(): number
    {
        return this._logListType;
    }

    // AS3: _SafeCls_3374.as::get logListId()
    get logListId(): number
    {
        return this._logListId;
    }

    // AS3: _SafeCls_3374.as::get totalLogs()
    get totalLogs(): number
    {
        return this._totalLogs;
    }

    // AS3: _SafeCls_3374.as::get currentPage()
    get currentPage(): number
    {
        return this._currentPage;
    }

    /**
	 * The page size that was *asked for*, not `logs.length` — the chests tab checks it against the
	 * ten it requested to tell its own reply apart from the paged window's.
	 */
    // AS3: _SafeCls_3374.as::get amount()
    get amount(): number
    {
        return this._amount;
    }

    // AS3: _SafeCls_3374.as::get logs()
    get logs(): WiredTransactionInfo[]
    {
        return this._logs;
    }

    // AS3: _SafeCls_3374.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: _SafeCls_3374.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._logListType = 0;
        this._logListId = 0;
        this._totalLogs = 0;
        this._currentPage = 0;
        this._amount = 0;
        this._logs = [];
        this._disposed = true;
    }
}
