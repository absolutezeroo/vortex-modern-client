import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * The full editable server-side state of one placed furni.
 *
 * NOT ported from AS3 — Vortex-only staff tool, no Habbo equivalent and therefore no AS3 source to
 * trace to. Header 8002; the field order below is the contract with the emulator's
 * `VortexFurniEditorDataMessageComposerSerializer.cs`.
 */
export class VortexFurniEditorDataMessageParser implements IMessageParser
{
    private _objectId: number = 0;

    get objectId(): number
    {
        return this._objectId;
    }

    private _productType: number = 0;

    /** 0 = floor, 1 = wall — the emulator's ProductType. Decides which controls the editor shows. */
    get productType(): number
    {
        return this._productType;
    }

    private _definitionId: number = 0;

    get definitionId(): number
    {
        return this._definitionId;
    }

    private _spriteId: number = 0;

    get spriteId(): number
    {
        return this._spriteId;
    }

    private _definitionName: string = '';

    /** Empty when the row points at a definition the server no longer has. */
    get definitionName(): string
    {
        return this._definitionName;
    }

    private _x: number = 0;

    get x(): number
    {
        return this._x;
    }

    private _y: number = 0;

    get y(): number
    {
        return this._y;
    }

    private _zHundredths: number = 0;

    /** Altitude in hundredths, as sent. Divide by 100 for a tile height. */
    get zHundredths(): number
    {
        return this._zHundredths;
    }

    private _direction: number = 0;

    get direction(): number
    {
        return this._direction;
    }

    private _wallOffset: number = 0;

    /** Zero for floor items. */
    get wallOffset(): number
    {
        return this._wallOffset;
    }

    private _extraData: string = '';

    get extraData(): string
    {
        return this._extraData;
    }

    private _ownerId: number = 0;

    get ownerId(): number
    {
        return this._ownerId;
    }

    private _ownerName: string = '';

    get ownerName(): string
    {
        return this._ownerName;
    }

    private _error: string = '';

    /** Empty on success. Otherwise a short machine-readable reason code from the server. */
    get error(): string
    {
        return this._error;
    }

    flush(): boolean
    {
        this._objectId = 0;
        this._productType = 0;
        this._definitionId = 0;
        this._spriteId = 0;
        this._definitionName = '';
        this._x = 0;
        this._y = 0;
        this._zHundredths = 0;
        this._direction = 0;
        this._wallOffset = 0;
        this._extraData = '';
        this._ownerId = 0;
        this._ownerName = '';
        this._error = '';

        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(wrapper === null)
        {
            return false;
        }

        this._objectId = wrapper.readInt();
        this._productType = wrapper.readInt();
        this._definitionId = wrapper.readInt();
        this._spriteId = wrapper.readInt();
        this._definitionName = wrapper.readString();
        this._x = wrapper.readInt();
        this._y = wrapper.readInt();
        this._zHundredths = wrapper.readInt();
        this._direction = wrapper.readInt();
        this._wallOffset = wrapper.readInt();
        this._extraData = wrapper.readString();
        this._ownerId = wrapper.readInt();
        this._ownerName = wrapper.readString();
        this._error = wrapper.readString();

        return true;
    }
}
