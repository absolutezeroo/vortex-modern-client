import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {WiredVariableStorageParameter} from './WiredVariableStorageParameter';

/**
 * Every permanent variable stored on one holder — a user, a pet or a bot — plus who that holder is.
 *
 * AS3 parses this in the constructor rather than in a `parse()` method, so the wrapper is read
 * here; `WiredUserPermanentVariablesEventParser` only holds the result.
 *
 * **The owner block is conditional.** `entityType == 1` is a user, and a user *is* its own owner, so
 * the wire carries no owner id/name/figure in that case. Reading them unconditionally would consume
 * the variable count as the owner id and desynchronise the rest of the buffer.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4074/WiredUserPermanentVariablesList.as
 * (name recovered from `sources/win63_version/habbo/communication/messages/incoming/
 * userdefinedroomevents/wiredmenu/variablesmanagement/WiredUserPermanentVariablesList.as`)
 */
export class WiredUserPermanentVariablesList
{
    // AS3: WiredUserPermanentVariablesList.as::entityType
    private _entityType: number = 0;
    // AS3: WiredUserPermanentVariablesList.as::entityId
    private _entityId: number = 0;
    // AS3: WiredUserPermanentVariablesList.as::entityName
    private _entityName: string = '';
    // AS3: WiredUserPermanentVariablesList.as::entityFigure
    private _entityFigure: string = '';
    // AS3: WiredUserPermanentVariablesList.as::ownerId
    private _ownerId: number = 0;
    // AS3: WiredUserPermanentVariablesList.as::_ownerName
    private _ownerName: string = '';
    // AS3: WiredUserPermanentVariablesList.as::ownerFigure
    private _ownerFigure: string = '';
    // AS3: WiredUserPermanentVariablesList.as::variableStorage
    private _variableStorage: WiredVariableStorageParameter[] = [];

    /**
	 * AS3 keeps a `Dictionary` of variable id -> true purely as a membership set; the view asks it
	 * `variableId in variableIds` to hide variables the holder already has from the create picker.
	 * A `Set` is that same structure without the sentinel value.
	 */
    // AS3: WiredUserPermanentVariablesList.as::variableIds
    private _variableIds: Set<string> = new Set();

    // AS3: WiredUserPermanentVariablesList.as::WiredUserPermanentVariablesList()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._entityType = wrapper.readInt();
        this._entityId = wrapper.readInt();
        this._entityName = wrapper.readString();
        this._entityFigure = wrapper.readString();

        // AS3: `if(entityType != 1)` — see the class note; a user is its own owner.
        if(this._entityType !== 1)
        {
            this._ownerId = wrapper.readInt();
            this._ownerName = wrapper.readString();
            this._ownerFigure = wrapper.readString();
        }

        const count: number = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            // AS3 passes `true` for the id flag: this list carries the variable id per entry, where
            // the same DTO read from a wired parameter block does not.
            const parameter = new WiredVariableStorageParameter(wrapper, true);

            this._variableStorage.push(parameter);

            if(parameter.variableId !== null) this._variableIds.add(parameter.variableId);
        }
    }

    // AS3: WiredUserPermanentVariablesList.as::get entityType()
    get entityType(): number
    {
        return this._entityType;
    }

    // AS3: WiredUserPermanentVariablesList.as::get entityId()
    get entityId(): number
    {
        return this._entityId;
    }

    // AS3: WiredUserPermanentVariablesList.as::get entityName()
    get entityName(): string
    {
        return this._entityName;
    }

    // AS3: WiredUserPermanentVariablesList.as::get entityFigure()
    get entityFigure(): string
    {
        return this._entityFigure;
    }

    // AS3: WiredUserPermanentVariablesList.as::get ownerId()
    get ownerId(): number
    {
        return this._ownerId;
    }

    // AS3: WiredUserPermanentVariablesList.as::get ownerName()
    get ownerName(): string
    {
        return this._ownerName;
    }

    // AS3: WiredUserPermanentVariablesList.as::get ownerFigure()
    get ownerFigure(): string
    {
        return this._ownerFigure;
    }

    // AS3: WiredUserPermanentVariablesList.as::get variableStorage()
    get variableStorage(): WiredVariableStorageParameter[]
    {
        return this._variableStorage;
    }

    // AS3: WiredUserPermanentVariablesList.as::get variableIds()
    get variableIds(): Set<string>
    {
        return this._variableIds;
    }
}
