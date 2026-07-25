import {MessageComposer} from '@core/communication/messages/MessageComposer';
import type {IFurniDefinition} from '@habbo/vortex/furnieditor/IFurniDefinition';

type FurniDefinitionTuple = [
    number, number, string, number, number, string, number, number, number, number,
    boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean,
    number, string, number
];

/**
 * Rewrites one `furniture_definitions` row.
 *
 * NOT ported from AS3 — Vortex-only staff tool. Header 8007; the field order below is the contract
 * with the emulator's `VortexApplyFurniDefinitionMessageParser.cs`.
 *
 * There is no field mask, unlike the placed-item editor: the server's write path takes a whole
 * `FurnitureDefinitionUpsertSpec` and rewrites every column, so the client sends the complete row it
 * is showing. That is only safe because the editor loaded that row from the server first.
 */
export class VortexApplyFurniDefinitionComposer extends MessageComposer<FurniDefinitionTuple>
{
    private _definition: IFurniDefinition;

    constructor(definition: IFurniDefinition)
    {
        super();

        this._definition = definition;
    }

    getMessageArray(): FurniDefinitionTuple
    {
        const definition = this._definition;

        return [
            Math.trunc(definition.definitionId),
            Math.trunc(definition.spriteId),
            definition.name,
            Math.trunc(definition.productType),
            Math.trunc(definition.furniCategory),
            definition.logic,
            Math.trunc(definition.totalStates),
            Math.trunc(definition.width),
            Math.trunc(definition.length),
            Math.trunc(definition.stackHeightHundredths),
            definition.canStack,
            definition.canWalk,
            definition.canSit,
            definition.canLay,
            definition.canRecycle,
            definition.canTrade,
            definition.canGroup,
            definition.canSell,
            Math.trunc(definition.usagePolicy),
            definition.extraData,
            Math.trunc(definition.stuffDataType)
        ];
    }
}
