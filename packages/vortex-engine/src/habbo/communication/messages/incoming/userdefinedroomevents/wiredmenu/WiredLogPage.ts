import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {WiredLogEntry} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredLogEntry';

/**
 * WiredLogPage — one page of the wired room-logs table: paging metadata (total entries, current page,
 * amount on this page), the log entries, and the active filters echoed back (log level / source, each
 * behind a "present" boolean, and a free-text query). The field read order below is authoritative for
 * the wire format.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4026/WiredLogPage.as
 */
export class WiredLogPage
{
    // AS3: WiredLogPage.as::_totalEntries
    private _totalEntries: number;

    // AS3: WiredLogPage.as::_SafeStr_4846 (name derived: current page)
    private _currentPage: number;

    // AS3: WiredLogPage.as::_amount
    private _amount: number;

    // AS3: WiredLogPage.as::_SafeStr_5134 (name derived: entries)
    private _elements: WiredLogEntry[];

    // AS3: WiredLogPage.as::_SafeStr_8350 (name derived: log-level filter, -1 if none)
    private _logLevelFilter: number;

    // AS3: WiredLogPage.as::_SafeStr_8242 (name derived: log-source filter, -1 if none)
    private _logSourceFilter: number;

    // AS3: WiredLogPage.as::_SafeStr_8035 (name derived: free-text query, null if none)
    private _query: string | null;

    // AS3: WiredLogPage.as::WiredLogPage()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._totalEntries = wrapper.readInt();
        this._currentPage = wrapper.readInt();
        this._amount = wrapper.readInt();
        this._elements = [];
        const count: number = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._elements.push(new WiredLogEntry(wrapper));
        }

        this._logLevelFilter = -1;
        this._logSourceFilter = -1;
        this._query = null;

        if(wrapper.readBoolean())
        {
            this._logLevelFilter = wrapper.readByte();
        }

        if(wrapper.readBoolean())
        {
            this._logSourceFilter = wrapper.readByte();
        }

        if(wrapper.readBoolean())
        {
            this._query = wrapper.readString();
        }
    }

    // AS3: WiredLogPage.as::get totalEntries()
    get totalEntries(): number
    {
        return this._totalEntries;
    }

    // AS3: WiredLogPage.as::get currentPage()
    get currentPage(): number
    {
        return this._currentPage;
    }

    // AS3: WiredLogPage.as::get amount()
    get amount(): number
    {
        return this._amount;
    }

    // AS3: WiredLogPage.as::get elements()
    get elements(): WiredLogEntry[]
    {
        return this._elements;
    }

    // AS3: WiredLogPage.as::get logLevelFilter()
    get logLevelFilter(): number
    {
        return this._logLevelFilter;
    }

    // AS3: WiredLogPage.as::get logSourceFilter()
    get logSourceFilter(): number
    {
        return this._logSourceFilter;
    }

    // AS3: WiredLogPage.as::get query()
    get query(): string | null
    {
        return this._query;
    }
}
