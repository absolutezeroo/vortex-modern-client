import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * RequestWiredRoomLogsComposer — asks the server for a page of the wired room-logs (WIN63 header
 * 706). Payload order: page, pageSize, then two filter slots and a free-text filter. The controller
 * requests the first page with `(1, PAGE_SIZE, -1, -1, '')`; the two -1s are "no filter" sentinels
 * (their exact per-slot meaning — furni id / user id — is not recoverable from the obfuscated dump,
 * so they are left as generic filter params).
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_3890`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3891/_SafeCls_3890.as
 */
export class RequestWiredRoomLogsComposer extends MessageComposer<(number | string)[]>
{
    private _data: (number | string)[];

    // AS3: _SafeCls_3890.as::_SafeCls_3890()
    constructor(page: number, pageSize: number, filterA: number, filterB: number, searchFilter: string)
    {
        super();
        this._data = [];
        this._data.push(page);
        this._data.push(pageSize);
        this._data.push(filterA);
        this._data.push(filterB);
        this._data.push(searchFilter);
    }

    // AS3: _SafeCls_3890.as::getMessageArray()
    getMessageArray(): (number | string)[]
    {
        return this._data;
    }
}
