import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks the server for one `furniture_definitions` row, to populate the definition editor.
 *
 * NOT ported from AS3 — Vortex-only staff tool. Header 8005.
 */
export class VortexGetFurniDefinitionComposer extends MessageComposer<[number]>
{
    private _definitionId: number;

    constructor(definitionId: number)
    {
        super();

        this._definitionId = definitionId;
    }

    getMessageArray(): [number]
    {
        return [this._definitionId];
    }
}
