import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';

/**
 * AllVariablesDiffMessageParser — a chunk of the delta between the client's cached wired variables and
 * the server's set: the new full hash, whether this is the last chunk, the removed variable ids, and the
 * added/updated variables each with their hash.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_2964`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/_SafeCls_2964.as
 */
export class AllVariablesDiffMessageParser implements IMessageParser
{
    // AS3: _SafeCls_2964.as::_allVariablesHash
    private _allVariablesHash: number = 0;

    // AS3: _SafeCls_2964.as::_SafeStr_7945 (name derived from getter isLastChunk)
    private _isLastChunk: boolean = false;

    // AS3: _SafeCls_2964.as::_SafeStr_7348 (name derived from getter removedVariables)
    private _removedVariables: string[] = [];

    // AS3: _SafeCls_2964.as::_SafeStr_7452 (name derived from getter addedOrUpdated: variable -> hash)
    private _addedOrUpdated: Map<WiredVariable, number> = new Map<WiredVariable, number>();

    // AS3: _SafeCls_2964.as::get allVariablesHash()
    get allVariablesHash(): number
    {
        return this._allVariablesHash;
    }

    // AS3: _SafeCls_2964.as::get isLastChunk()
    get isLastChunk(): boolean
    {
        return this._isLastChunk;
    }

    // AS3: _SafeCls_2964.as::get removedVariables()
    get removedVariables(): string[]
    {
        return this._removedVariables;
    }

    // AS3: _SafeCls_2964.as::get addedOrUpdated()
    get addedOrUpdated(): Map<WiredVariable, number>
    {
        return this._addedOrUpdated;
    }

    // AS3: _SafeCls_2964.as::flush()
    flush(): boolean
    {
        this._allVariablesHash = 0;
        this._isLastChunk = false;
        this._removedVariables = [];
        this._addedOrUpdated = new Map<WiredVariable, number>();
        return true;
    }

    // AS3: _SafeCls_2964.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._allVariablesHash = wrapper.readInt();
        this._isLastChunk = wrapper.readBoolean();

        const removedCount = wrapper.readInt();
        this._removedVariables = [];

        for(let i = 0; i < removedCount; i++)
        {
            this._removedVariables.push(wrapper.readString());
        }

        const addedCount = wrapper.readInt();
        this._addedOrUpdated = new Map<WiredVariable, number>();

        for(let i = 0; i < addedCount; i++)
        {
            const hash = wrapper.readInt();
            const variable = new WiredVariable(wrapper);
            this._addedOrUpdated.set(variable, hash);
        }

        return true;
    }
}
