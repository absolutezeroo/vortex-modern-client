import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export interface IRentableSpaceCurrencyOption
{
    id: number;
    name: string;
}

/**
 * Parser for the rentable space furni's current rental configuration.
 *
 * Vortex-custom message (not part of the official AS3 client dumps).
 * @see vortex-client/src/com/sulake/habbo/communication/messages/parser/room/furniture/RentableSpaceConfigMessageParser.as
 */
export class RentableSpaceConfigMessageEventParser implements IMessageParser
{
    private _furnitureId: number = 0;

    get furnitureId(): number
    {
        return this._furnitureId;
    }

    private _isConfigured: boolean = false;

    get isConfigured(): boolean
    {
        return this._isConfigured;
    }

    private _price: number = 0;

    get price(): number
    {
        return this._price;
    }

    private _currencyTypeId: number = 0;

    get currencyTypeId(): number
    {
        return this._currencyTypeId;
    }

    private _rentDurationSeconds: number = 0;

    get rentDurationSeconds(): number
    {
        return this._rentDurationSeconds;
    }

    private _requiresHc: boolean = false;

    get requiresHc(): boolean
    {
        return this._requiresHc;
    }

    private _currencies: IRentableSpaceCurrencyOption[] = [];

    get currencies(): IRentableSpaceCurrencyOption[]
    {
        return this._currencies;
    }

    flush(): boolean
    {
        this._furnitureId = 0;
        this._isConfigured = false;
        this._price = 0;
        this._currencyTypeId = 0;
        this._rentDurationSeconds = 0;
        this._requiresHc = false;
        this._currencies = [];
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._furnitureId = wrapper.readInt();
        this._isConfigured = wrapper.readBoolean();
        this._price = wrapper.readInt();
        this._currencyTypeId = wrapper.readInt();
        this._rentDurationSeconds = wrapper.readInt();
        this._requiresHc = wrapper.readBoolean();

        const count = wrapper.readInt();
        this._currencies = [];

        for(let i = 0; i < count; i++)
        {
            this._currencies.push({id: wrapper.readInt(), name: wrapper.readString()});
        }

        return true;
    }
}
