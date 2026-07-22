import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Saves a wired SELECTOR definition (WIN63 header 510). Same shape as the trigger composer plus the
 * filter and inverse boolean flags written right after the primary furni ids.
 *
 * Name is unobfuscated in the primary WIN63 tree: UpdateSelectorMessageComposer.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/outgoing/userdefinedroomevents/UpdateSelectorMessageComposer.as
 */
export class UpdateSelectorMessageComposer extends MessageComposer<unknown[]>
{
    private _data: unknown[] = [];

    // AS3: UpdateSelectorMessageComposer.as::UpdateSelectorMessageComposer()
    constructor(id: number, intParams: number[], variableIds: string[], stringParam: string, stuffIds: number[], stuffIds2: number[], filter: boolean, inverse: boolean, furniSources: number[], userSources: number[])
    {
        super();

        this._data.push(id);
        this.pushArray(intParams);
        this._data.push(stringParam);
        this.pushArray(stuffIds);
        this._data.push(filter);
        this._data.push(inverse);
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

    // AS3: UpdateSelectorMessageComposer.as::getMessageArray()
    getMessageArray(): unknown[]
    {
        return this._data;
    }
}
