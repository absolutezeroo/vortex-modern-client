import {MessageComposer} from '@core/communication/messages/MessageComposer';
import type {FurniEditField} from '@habbo/vortex/furnieditor/FurniEditField';

/**
 * Applies an edit to one placed furni from the furni editor.
 *
 * NOT ported from AS3 — Vortex-only staff tool, no Habbo equivalent and therefore no AS3 source to
 * trace to. Header 8003; the emulator reads this in
 * `Vortex.Revisions/Revision20260701/Parsers/Room/Engine/VortexApplyFurniEditMessageParser.cs`, and
 * the field order below is the contract with it — both sides write every field regardless of the
 * mask, so a reordering here runs the server's read off the end of the buffer.
 *
 * Every number must be an integer: WireFormatter encodes non-integer numbers as a float, which the
 * server would read as an int. That is why the altitude travels as hundredths (matching the
 * emulator's `Altitude.FromInt`) rather than as a fractional tile height.
 */
export class VortexApplyFurniEditComposer extends MessageComposer<
    [number, number, number, number, number, number, number, string, string, number]
>
{
    private _objectId: number;
    private _fields: number;
    private _x: number;
    private _y: number;
    private _zHundredths: number;
    private _direction: number;
    private _wallOffset: number;
    private _extraData: string;
    private _ownerName: string;
    private _definitionId: number;

    constructor(
        objectId: number,
        fields: FurniEditField | number,
        x: number,
        y: number,
        zHundredths: number,
        direction: number,
        wallOffset: number,
        extraData: string,
        ownerName: string,
        definitionId: number
    )
    {
        super();

        this._objectId = objectId;
        this._fields = fields;
        this._x = Math.trunc(x);
        this._y = Math.trunc(y);
        this._zHundredths = Math.trunc(zHundredths);
        this._direction = Math.trunc(direction);
        this._wallOffset = Math.trunc(wallOffset);
        this._extraData = extraData;
        this._ownerName = ownerName;
        this._definitionId = Math.trunc(definitionId);
    }

    getMessageArray(): [number, number, number, number, number, number, number, string, string, number]
    {
        return [
            this._objectId,
            this._fields,
            this._x,
            this._y,
            this._zHundredths,
            this._direction,
            this._wallOffset,
            this._extraData,
            this._ownerName,
            this._definitionId
        ];
    }
}
