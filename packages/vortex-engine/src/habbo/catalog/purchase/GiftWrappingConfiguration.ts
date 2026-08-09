import type {GiftWrappingConfigurationEventParser} from '@habbo/communication/messages/parser/catalog/GiftWrappingConfigurationEventParser';

/**
 * The catalog's gift-wrapping options, snapshotted off the configuration message.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/GiftWrappingConfiguration.as
 */
export class GiftWrappingConfiguration
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/GiftWrappingConfiguration.as::get isEnabled()
    private _isEnabled: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/GiftWrappingConfiguration.as::get price()
    private _price: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/GiftWrappingConfiguration.as::get stuffTypes()
    private _stuffTypes: number[] = [];

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/GiftWrappingConfiguration.as::get boxTypes()
    private _boxTypes: number[] = [];

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/GiftWrappingConfiguration.as::get ribbonTypes()
    private _ribbonTypes: number[] = [];

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/GiftWrappingConfiguration.as::get defaultStuffTypes()
    private _defaultStuffTypes: number[] = [];

    /**
     * AS3 takes the event and pulls the parser out of it. This takes the parser directly: the port
     * routes handlers through `event.parser`, so the caller already holds it and passing the event
     * would only re-derive what it has.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/GiftWrappingConfiguration.as::GiftWrappingConfiguration()
    constructor(parser: GiftWrappingConfigurationEventParser | null)
    {
        if(!parser) return;

        this._isEnabled = parser.isWrappingEnabled;
        this._price = parser.wrappingPrice;
        this._stuffTypes = parser.stuffTypes;
        this._boxTypes = parser.boxTypes;
        this._ribbonTypes = parser.ribbonTypes;
        this._defaultStuffTypes = parser.defaultStuffTypes;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/GiftWrappingConfiguration.as::get isEnabled()
    get isEnabled(): boolean
    {
        return this._isEnabled;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/GiftWrappingConfiguration.as::get price()
    get price(): number
    {
        return this._price;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/GiftWrappingConfiguration.as::get stuffTypes()
    get stuffTypes(): number[]
    {
        return this._stuffTypes;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/GiftWrappingConfiguration.as::get boxTypes()
    get boxTypes(): number[]
    {
        return this._boxTypes;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/GiftWrappingConfiguration.as::get ribbonTypes()
    get ribbonTypes(): number[]
    {
        return this._ribbonTypes;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/GiftWrappingConfiguration.as::get defaultStuffTypes()
    get defaultStuffTypes(): number[]
    {
        return this._defaultStuffTypes;
    }
}
