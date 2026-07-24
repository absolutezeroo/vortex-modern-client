import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * RequestVariableManagementComposer — opens (or pages) the variable-management view for a single
 * user-persisted variable (WIN63 header 2221). Payload order: variable id, page, page size, offset,
 * and a sort column (the overview tab's "manage" button sends `(id, 1, PAGE_SIZE, 0, -1)`; -1 is the
 * "no sort column" sentinel).
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_3265`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2427/_SafeCls_3265.as
 */
export class RequestVariableManagementComposer extends MessageComposer<(number | string)[]>
{
    private _data: (number | string)[];

    // AS3: _SafeCls_3265.as::_SafeCls_3265()
    constructor(variableId: string, page: number, pageSize: number, offset: number, sortColumn: number)
    {
        super();
        this._data = [];
        this._data.push(variableId);
        this._data.push(page);
        this._data.push(pageSize);
        this._data.push(offset);
        this._data.push(sortColumn);
    }

    // AS3: _SafeCls_3265.as::getMessageArray()
    getMessageArray(): (number | string)[]
    {
        return this._data;
    }
}
