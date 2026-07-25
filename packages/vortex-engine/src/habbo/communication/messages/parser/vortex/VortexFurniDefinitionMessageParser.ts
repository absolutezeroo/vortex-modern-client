import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IFurniDefinition} from '@habbo/vortex/furnieditor/IFurniDefinition';

/**
 * One `furniture_definitions` row, as stored by the server.
 *
 * NOT ported from AS3 — Vortex-only staff tool. Header 8006; the read order below is the contract
 * with the emulator's `VortexFurniDefinitionMessageComposerSerializer.cs`.
 */
export class VortexFurniDefinitionMessageParser implements IMessageParser
{
    private _definition: IFurniDefinition | null = null;

    /** Null until a message has been parsed. */
    get definition(): IFurniDefinition | null
    {
        return this._definition;
    }

    private _error: string = '';

    /** Empty on success; otherwise the admin service's own error code, shown verbatim. */
    get error(): string
    {
        return this._error;
    }

    flush(): boolean
    {
        this._definition = null;
        this._error = '';

        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(wrapper === null)
        {
            return false;
        }

        this._definition = {
            definitionId: wrapper.readInt(),
            spriteId: wrapper.readInt(),
            name: wrapper.readString(),
            productType: wrapper.readInt(),
            furniCategory: wrapper.readInt(),
            logic: wrapper.readString(),
            totalStates: wrapper.readInt(),
            width: wrapper.readInt(),
            length: wrapper.readInt(),
            stackHeightHundredths: wrapper.readInt(),
            canStack: wrapper.readBoolean(),
            canWalk: wrapper.readBoolean(),
            canSit: wrapper.readBoolean(),
            canLay: wrapper.readBoolean(),
            canRecycle: wrapper.readBoolean(),
            canTrade: wrapper.readBoolean(),
            canGroup: wrapper.readBoolean(),
            canSell: wrapper.readBoolean(),
            usagePolicy: wrapper.readInt(),
            extraData: wrapper.readString(),
            stuffDataType: wrapper.readInt()
        };

        this._error = wrapper.readString();

        return true;
    }
}
