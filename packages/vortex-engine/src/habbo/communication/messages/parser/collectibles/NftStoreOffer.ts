import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {CollectibleItem} from './CollectibleItem';

/**
 * One product on sale in the NFT store: its emerald price, its mint supply, and what it is.
 *
 * Name DERIVED: obfuscated in every tree, named for the accessor that returns a list of these
 * (`NftStoreOffersMessageParser.nftStoreOffers`); the emulator's `NftStoreOffersMessageComposer`
 * @3272 agrees.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_3898.as
 */
export class NftStoreOffer
{
    // AS3: _SafeCls_3898.as::_productCode
    private _productCode: string = '';
    // AS3: _SafeCls_3898.as::_SafeStr_10047 (from `get emeraldPrice()`)
    private _emeraldPrice: number = 0;
    // AS3: _SafeCls_3898.as::_SafeStr_9197 (from `get isFeatured()`)
    private _isFeatured: boolean = false;
    // AS3: _SafeCls_3898.as::_SafeStr_9396 (from `get isLimited()`)
    private _isLimited: boolean = false;
    // AS3: _SafeCls_3898.as::_SafeStr_10003 (from `get mintLimit()`)
    private _mintLimit: number = 0;
    // AS3: _SafeCls_3898.as::_SafeStr_9385 (from `get mintedCount()`)
    private _mintedCount: number = 0;
    // AS3: _SafeCls_3898.as::_SafeStr_9040 (from `get productInfo()`)
    private _productInfo: CollectibleItem;

    // AS3: _SafeCls_3898.as::_SafeCls_3898()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._productCode = wrapper.readString();
        this._emeraldPrice = wrapper.readInt();
        this._isFeatured = wrapper.readBoolean();
        this._isLimited = wrapper.readBoolean();
        this._mintLimit = wrapper.readInt();
        this._mintedCount = wrapper.readInt();
        this._productInfo = new CollectibleItem(wrapper);
    }

    // AS3: _SafeCls_3898.as::get productCode()
    get productCode(): string
    {
        return this._productCode;
    }

    // AS3: _SafeCls_3898.as::get emeraldPrice()
    get emeraldPrice(): number
    {
        return this._emeraldPrice;
    }

    // AS3: _SafeCls_3898.as::get isFeatured()
    get isFeatured(): boolean
    {
        return this._isFeatured;
    }

    // AS3: _SafeCls_3898.as::get isLimited()
    get isLimited(): boolean
    {
        return this._isLimited;
    }

    // AS3: _SafeCls_3898.as::get mintLimit()
    get mintLimit(): number
    {
        return this._mintLimit;
    }

    // AS3: _SafeCls_3898.as::get mintedCount()
    get mintedCount(): number
    {
        return this._mintedCount;
    }

    // AS3: _SafeCls_3898.as::get productInfo()
    get productInfo(): CollectibleItem
    {
        return this._productInfo;
    }
}
