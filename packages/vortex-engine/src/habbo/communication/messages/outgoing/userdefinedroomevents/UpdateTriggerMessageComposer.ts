import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Saves a wired TRIGGER definition (WIN63 header 3953). Serialises the edited form: id, int params,
 * string param, selected furni ids, furni/user source types, variable ids, secondary furni ids.
 *
 * Name recovered from sources/win63_version (unobfuscated) + PRODUCTION 2016:
 * UpdateTriggerMessageComposer. The primary WIN63 wire format below (8 params) is the authority; the
 * 2016 build's composer has a different, older signature.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/outgoing/userdefinedroomevents/_SafeCls_2484.as
 */
export class UpdateTriggerMessageComposer extends MessageComposer<unknown[]>
{
    private _data: unknown[] = [];

    // AS3: _SafeCls_2484.as::_SafeCls_2484()
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

    // AS3: _SafeCls_2484.as::getMessageArray()
    getMessageArray(): unknown[]
    {
        return this._data;
    }
}
