import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks the server for the full editable state of one placed furni, to populate the furni editor.
 *
 * NOT ported from AS3 — Vortex-only staff tool, no Habbo equivalent and therefore no AS3 source to
 * trace to. Header 8001; the emulator's half is
 * `Vortex.Revisions/Revision20260701/Headers.cs::VortexGetFurniEditorDataMessageEvent`.
 */
export class VortexGetFurniEditorDataComposer extends MessageComposer<[number]>
{
    private _objectId: number;

    constructor(objectId: number)
    {
        super();

        this._objectId = objectId;
    }

    getMessageArray(): [number]
    {
        return [this._objectId];
    }
}
