import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * WiredVariableStorageParameter — one stored wired-variable value with its audit timestamps: the
 * value, its creation and last-update times (raw + pre-formatted strings), and — when the message
 * includes it — the owning variable id. Constructed inline from the message stream; the field read
 * order below is authoritative for the wire format.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4074/WiredVariableStorageParameter.as
 */
export class WiredVariableStorageParameter
{
    // AS3: WiredVariableStorageParameter.as::_SafeStr_9014 (name derived: variable id, optional)
    private _variableId: string | null = null;

    // AS3: WiredVariableStorageParameter.as::_SafeStr_4717 (name derived: value)
    private _value: number;

    // AS3: WiredVariableStorageParameter.as::_creationTime
    private _creationTime: number;

    // AS3: WiredVariableStorageParameter.as::_SafeStr_9514 (name derived: formatted creation time)
    private _creationTimeStr: string;

    // AS3: WiredVariableStorageParameter.as::_lastUpdateTime
    private _lastUpdateTime: number;

    // AS3: WiredVariableStorageParameter.as::_SafeStr_10015 (name derived: formatted last-update time)
    private _lastUpdateTimeStr: string;

    // AS3: WiredVariableStorageParameter.as::WiredVariableStorageParameter()
    constructor(wrapper: IMessageDataWrapper, includeVariableId: boolean = false)
    {
        if(includeVariableId)
        {
            this._variableId = wrapper.readString();
        }

        this._value = wrapper.readInt();
        this._creationTime = wrapper.readLong();
        this._creationTimeStr = wrapper.readString();
        this._lastUpdateTime = wrapper.readLong();
        this._lastUpdateTimeStr = wrapper.readString();
    }

    // AS3: WiredVariableStorageParameter.as::get variableId()
    get variableId(): string | null
    {
        return this._variableId;
    }

    // AS3: WiredVariableStorageParameter.as::get value()
    get value(): number
    {
        return this._value;
    }

    // AS3: WiredVariableStorageParameter.as::get creationTime()
    get creationTime(): number
    {
        return this._creationTime;
    }

    // AS3: WiredVariableStorageParameter.as::get creationTimeStr()
    get creationTimeStr(): string
    {
        return this._creationTimeStr;
    }

    // AS3: WiredVariableStorageParameter.as::get lastUpdateTime()
    get lastUpdateTime(): number
    {
        return this._lastUpdateTime;
    }

    // AS3: WiredVariableStorageParameter.as::get lastUpdateTimeStr()
    get lastUpdateTimeStr(): string
    {
        return this._lastUpdateTimeStr;
    }
}
