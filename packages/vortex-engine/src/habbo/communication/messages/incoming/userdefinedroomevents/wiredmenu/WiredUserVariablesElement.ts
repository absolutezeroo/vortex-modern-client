import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {WiredVariableStorageParameter} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredVariableStorageParameter';

/**
 * WiredUserVariablesElement — one row of the variable-management overview: the entity (user/bot/etc.)
 * that holds a value of the managed variable, with its type, id, name and the stored value/timestamps.
 * The field read order below is authoritative for the wire format.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4074/WiredUserVariablesElement.as
 */
export class WiredUserVariablesElement
{
    // AS3: WiredUserVariablesElement.as::_SafeStr_8548 (name derived: entity type)
    private _entityType: number;

    // AS3: WiredUserVariablesElement.as::_SafeStr_9748 (name derived: entity id)
    private _entityId: number;

    // AS3: WiredUserVariablesElement.as::_SafeStr_8879 (name derived: entity name)
    private _entityName: string;

    // AS3: WiredUserVariablesElement.as::_SafeStr_9970 (name derived: stored value)
    private _storage: WiredVariableStorageParameter;

    // AS3: WiredUserVariablesElement.as::WiredUserVariablesElement()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._entityType = wrapper.readInt();
        this._entityId = wrapper.readInt();
        this._entityName = wrapper.readString();
        this._storage = new WiredVariableStorageParameter(wrapper);
    }

    // AS3: WiredUserVariablesElement.as::get entityType()
    get entityType(): number
    {
        return this._entityType;
    }

    // AS3: WiredUserVariablesElement.as::get entityId()
    get entityId(): number
    {
        return this._entityId;
    }

    // AS3: WiredUserVariablesElement.as::get entityName()
    get entityName(): string
    {
        return this._entityName;
    }

    // AS3: WiredUserVariablesElement.as::get storage()
    get storage(): WiredVariableStorageParameter
    {
        return this._storage;
    }
}
