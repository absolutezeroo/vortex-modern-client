import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Set, create or delete one permanent variable on a holder — header 625 in WIN63's registry
 * (`_SafeCls_2046.as::_composers[625]`), corroborated by vortex-emulator's
 * `WiredSetObjectVariableValueMessageEvent = 625`.
 *
 * All three operations are this one message; `mode` decides which:
 *
 * | mode | sent from                                         |
 * |------|---------------------------------------------------|
 * | 0    | `onCellEdit()` — write a new value                 |
 * | 1    | `onCreateVariableClicked()` — add the variable     |
 * | 2    | `onDeleteVariableClicked()` — remove it            |
 *
 * The names are AS3's parameter order, not invented: delete still carries a `value` (AS3 sends 0)
 * and create carries the value typed into the bubble, or 0 for a variable that holds none.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2427/_SafeCls_2426.as
 * (name recovered from `sources/win63_version/habbo/communication/messages/outgoing/
 * userdefinedroomevents/wiredmenu/variablesmanagement/WiredSetUserPermanentVariableComposer.as`)
 */
export class WiredSetUserPermanentVariableComposer extends MessageComposer<[number, number, string, number, number]>
{
    private _data: [number, number, string, number, number];

    // AS3: _SafeCls_2426.as::_SafeCls_2426()
    constructor(entityType: number, entityId: number, variableId: string, value: number, mode: number)
    {
        super();

        this._data = [entityType, entityId, variableId, value, mode];
    }

    // AS3: _SafeCls_2426.as::getMessageArray()
    getMessageArray(): [number, number, string, number, number]
    {
        return this._data;
    }
}
