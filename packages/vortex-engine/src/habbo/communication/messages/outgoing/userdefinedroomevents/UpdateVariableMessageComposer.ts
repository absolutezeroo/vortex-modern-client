import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Saves a wired VARIABLE definition (WIN63 header 2475). Identical wire shape to the trigger composer.
 *
 * Name recovered from sources/win63_version (unobfuscated): UpdateVariableMessageComposer. (Variables
 * postdate the PRODUCTION 2016 build, so that tree has no such composer.)
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/outgoing/userdefinedroomevents/_SafeCls_3053.as
 */
export class UpdateVariableMessageComposer extends MessageComposer<unknown[]>
{
    private _data: unknown[] = [];

    // AS3: _SafeCls_3053.as::_SafeCls_3053()
    constructor(id: number, intParams: number[], variableIds: string[], stringParam: string, stuffIds: number[], stuffIds2: number[], furniSources: number[], userSources: number[])
    {
        super();

        this._data.push(id);
        this.pushArray(intParams);
        this._data.push(stringParam);
        this.pushArray(stuffIds);
        this.pushArray(furniSources);
        this.pushArray(userSources);
        this.pushArray(variableIds);
        this.pushArray(stuffIds2);
    }

    private pushArray(values: Array<number | string>): void
    {
        this._data.push(values.length);

        for(const value of values)
        {
            this._data.push(value);
        }
    }

    // AS3: _SafeCls_3053.as::getMessageArray()
    getMessageArray(): unknown[]
    {
        return this._data;
    }
}
