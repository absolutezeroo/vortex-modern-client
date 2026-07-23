import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * WiredErrorData — one wired execution-error entry shown in the monitor tab: its id, human name,
 * category, how many times it was thrown, and how long ago it last occurred (ms).
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4476`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2538/_SafeCls_4476.as
 */
export class WiredErrorData
{
    // AS3: _SafeCls_4476.as::_SafeStr_9400 (name derived: error id)
    private _errorId: number;

    // AS3: _SafeCls_4476.as::_SafeStr_9455 (name derived: error name)
    private _errorName: string;

    // AS3: _SafeCls_4476.as::_SafeStr_4689 (name derived: category)
    private _category: string;

    // AS3: _SafeCls_4476.as::_SafeStr_10170 (name derived: throw count)
    private _throwCount: number;

    // AS3: _SafeCls_4476.as::_SafeStr_9048 (name derived: ms since last occurrence)
    private _msSinceLastOccurrence: number;

    // AS3: _SafeCls_4476.as::_SafeCls_4476()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._errorId = wrapper.readInt();
        this._errorName = wrapper.readString();
        this._category = wrapper.readString();
        this._throwCount = wrapper.readInt();
        this._msSinceLastOccurrence = wrapper.readLong();
    }

    // AS3: _SafeCls_4476.as::get errorId()
    get errorId(): number { return this._errorId; }

    // AS3: _SafeCls_4476.as::get errorName()
    get errorName(): string { return this._errorName; }

    // AS3: _SafeCls_4476.as::get category()
    get category(): string { return this._category; }

    // AS3: _SafeCls_4476.as::get throwCount()
    get throwCount(): number { return this._throwCount; }

    // AS3: _SafeCls_4476.as::get msSinceLastOccurrence()
    get msSinceLastOccurrence(): number { return this._msSinceLastOccurrence; }
}
