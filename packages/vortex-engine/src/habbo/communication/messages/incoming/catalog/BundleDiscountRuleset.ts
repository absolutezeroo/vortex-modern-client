import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * The server-side rules governing bundle-quantity discounts in the catalog.
 *
 * The class name is DERIVED, not recovered: this DTO is obfuscated in every available tree
 * (`_SafePkg_1716._SafeCls_1903` in WIN63, `incoming/catalog/class_1766` in win63_version) and it
 * postdates the 2016 PRODUCTION build, so no tree carries its real identifier. Its *members* are
 * not obfuscated, so every accessor below is a real AS3 name. `BundleDiscountRuleset` is taken
 * from `HabboCatalog::get bundleDiscountRuleset()`, the only readable thing naming it.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1716/_SafeCls_1903.as
 */
export class BundleDiscountRuleset
{
    private _maxPurchaseSize: number = 0;

    private _bundleSize: number = 0;

    private _bundleDiscountSize: number = 0;

    private _bonusThreshold: number = 0;

    private _additionalBonusDiscountThresholdQuantities: number[] = [];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1716/_SafeCls_1903.as::_SafeCls_1903()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._maxPurchaseSize = wrapper.readInt();
        this._bundleSize = wrapper.readInt();
        this._bundleDiscountSize = wrapper.readInt();
        this._bonusThreshold = wrapper.readInt();

        this._additionalBonusDiscountThresholdQuantities = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._additionalBonusDiscountThresholdQuantities.push(wrapper.readInt());
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1716/_SafeCls_1903.as::get maxPurchaseSize()
    get maxPurchaseSize(): number
    {
        return this._maxPurchaseSize;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1716/_SafeCls_1903.as::get bundleSize()
    get bundleSize(): number
    {
        return this._bundleSize;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1716/_SafeCls_1903.as::get bundleDiscountSize()
    get bundleDiscountSize(): number
    {
        return this._bundleDiscountSize;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1716/_SafeCls_1903.as::get bonusThreshold()
    get bonusThreshold(): number
    {
        return this._bonusThreshold;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1716/_SafeCls_1903.as::get additionalBonusDiscountThresholdQuantities()
    get additionalBonusDiscountThresholdQuantities(): number[]
    {
        return this._additionalBonusDiscountThresholdQuantities;
    }
}
