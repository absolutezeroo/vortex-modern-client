import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Saves a wired CONDITION definition (WIN63 header 767). Same shape as the trigger composer plus the
 * quantifier code written right after the primary furni ids (the int slot the action composer uses
 * for its delay).
 *
 * Name recovered from sources/win63_version (unobfuscated) + PRODUCTION 2016:
 * UpdateConditionMessageComposer.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/outgoing/userdefinedroomevents/_SafeCls_3197.as
 */
export class UpdateConditionMessageComposer extends MessageComposer<unknown[]>
{
    private _data: unknown[] = [];

    // AS3: _SafeCls_3197.as::_SafeCls_3197()
    constructor(id: number, intParams: number[], variableIds: string[], stringParam: string, stuffIds: number[], stuffIds2: number[], quantifier: number, furniSources: number[], userSources: number[])
    {
        super();

        this._data.push(id);
        this.pushArray(intParams);
        this._data.push(stringParam);
        this.pushArray(stuffIds);
        this._data.push(quantifier);
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

    // AS3: _SafeCls_3197.as::getMessageArray()
    getMessageArray(): unknown[]
    {
        return this._data;
    }
}
