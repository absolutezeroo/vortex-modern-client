import type {IStuffData} from '@habbo/inventory/items/IStuffData';

/**
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceOfferData.as
 */
export interface IMarketPlaceOfferData
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceOfferData.as::get offerId()
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceOfferData.as::set offerId()
    offerId: number;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceOfferData.as::get furniId()
    readonly furniId: number;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceOfferData.as::get furniType()
    readonly furniType: number;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceOfferData.as::get extraData()
    readonly extraData: string | null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceOfferData.as::get stuffData()
    readonly stuffData: IStuffData | null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceOfferData.as::get price()
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceOfferData.as::set price()
    price: number;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceOfferData.as::get averagePrice()
    readonly averagePrice: number;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceOfferData.as::get image()
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceOfferData.as::set image()
    // TS deviation: ImageBitmap, not BitmapData - see docs/PATTERNS.md image-loading note.
    image: ImageBitmap | null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceOfferData.as::get imageCallback()
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceOfferData.as::set imageCallback()
    imageCallback: number;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceOfferData.as::get status()
    readonly status: number;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceOfferData.as::get timeLeftMinutes()
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceOfferData.as::set timeLeftMinutes()
    timeLeftMinutes: number;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceOfferData.as::get offerCount()
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceOfferData.as::set offerCount()
    offerCount: number;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceOfferData.as::get isUsable()
    readonly isUsable: boolean;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceOfferData.as::get isUsed()
    readonly isUsed: boolean;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceOfferData.as::get isUniqueLimitedItem()
    readonly isUniqueLimitedItem: boolean;
}
