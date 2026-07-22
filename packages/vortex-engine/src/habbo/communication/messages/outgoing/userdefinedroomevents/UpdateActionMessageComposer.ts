import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Saves a wired ACTION definition (WIN63 header 2197). Same shape as the trigger composer plus the
 * action delay (in pulses) written right after the primary furni ids.
 *
 * Name recovered from sources/win63_version (unobfuscated) + PRODUCTION 2016:
 * UpdateActionMessageComposer.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/outgoing/userdefinedroomevents/_SafeCls_2689.as
 */
export class UpdateActionMessageComposer extends MessageComposer<unknown[]>
{
    private _data: unknown[] = [];

    // AS3: _SafeCls_2689.as::_SafeCls_2689()
    constructor(id: number, intParams: number[], variableIds: string[], stringParam: string, stuffIds: number[], stuffIds2: number[], actionDelay: number, furniSources: number[], userSources: number[])
    {
        super();

        this._data.push(id);
        this.pushArray(intParams);
        this._data.push(stringParam);
        this.pushArray(stuffIds);
        this._data.push(actionDelay);
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

    // AS3: _SafeCls_2689.as::getMessageArray()
    getMessageArray(): unknown[]
    {
        return this._data;
    }
}
