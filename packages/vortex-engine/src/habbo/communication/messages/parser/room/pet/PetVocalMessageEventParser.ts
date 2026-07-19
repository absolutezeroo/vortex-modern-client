import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for a pet's vocal (sound/animation) event.
 *
 * Vortex-custom message (not part of the official AS3 client dumps).
 * @see vortex-client/src/com/sulake/habbo/communication/messages/parser/room/pets/PetVocalMessageParser.as
 */
export class PetVocalMessageEventParser implements IMessageParser
{
    private _petObjectId: number = 0;

    get petObjectId(): number
    {
        return this._petObjectId;
    }

    private _petType: number = 0;

    get petType(): number
    {
        return this._petType;
    }

    private _vocalType: string = '';

    get vocalType(): string
    {
        return this._vocalType;
    }

    private _vocalIndex: number = 0;

    get vocalIndex(): number
    {
        return this._vocalIndex;
    }

    flush(): boolean
    {
        this._petObjectId = 0;
        this._petType = 0;
        this._vocalType = '';
        this._vocalIndex = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._petObjectId = wrapper.readInt();
        this._petType = wrapper.readInt();
        this._vocalType = wrapper.readString();
        this._vocalIndex = wrapper.readInt();

        return true;
    }
}
