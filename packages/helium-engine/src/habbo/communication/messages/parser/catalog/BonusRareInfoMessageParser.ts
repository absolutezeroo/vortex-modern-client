import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for bonus rare info message.
 * @see source_nitro_renderer/.../parser/catalog/BonusRareInfoMessageParser.ts
 */
export class BonusRareInfoMessageParser implements IMessageParser
{
    private _productType: string = '';

    get productType(): string
    {
        return this._productType;
    }

    private _productClassId: number = -1;

    get productClassId(): number
    {
        return this._productClassId;
    }

    private _totalCoinsForBonus: number = -1;

    get totalCoinsForBonus(): number
    {
        return this._totalCoinsForBonus;
    }

    private _coinsStillRequiredToBuy: number = -1;

    get coinsStillRequiredToBuy(): number
    {
        return this._coinsStillRequiredToBuy;
    }

    flush(): boolean
    {
        this._productType = '';
        this._productClassId = -1;
        this._totalCoinsForBonus = -1;
        this._coinsStillRequiredToBuy = -1;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._productType = wrapper.readString();
        this._productClassId = wrapper.readInt();
        this._totalCoinsForBonus = wrapper.readInt();
        this._coinsStillRequiredToBuy = wrapper.readInt();
        return true;
    }
}
