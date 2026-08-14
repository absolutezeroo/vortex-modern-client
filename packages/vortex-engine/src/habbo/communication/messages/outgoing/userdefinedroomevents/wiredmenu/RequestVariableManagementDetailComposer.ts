import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * RequestVariableManagementDetailComposer — opens the variable-management detail view for one holder
 * of the managed variable, from the overview's "manage" link (WIN63 header 3777). Payload: entity
 * type and entity id.
 *
 * Name is this port's own — but not because none survived. `sources/win63_version/habbo/
 * communication/messages/outgoing/userdefinedroomevents/wiredmenu/variablesmanagement/
 * WiredGetUserPermanentVariablesComposer.as` carries the real one, so the earlier claim here that
 * it was "fully obfuscated in AS3" was wrong. Kept unrenamed to avoid churning its call sites; its
 * write-side sibling `WiredSetUserPermanentVariableComposer` (625) does use the recovered name.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2427/_SafeCls_2724.as
 */
export class RequestVariableManagementDetailComposer extends MessageComposer<[number, number]>
{
    private _data: [number, number];

    // AS3: _SafeCls_2724.as::_SafeCls_2724()
    constructor(entityType: number, entityId: number)
    {
        super();
        this._data = [entityType, entityId];
    }

    // AS3: _SafeCls_2724.as::getMessageArray()
    getMessageArray(): [number, number]
    {
        return this._data;
    }
}
