import type {IProductDisplayInfo} from '@habbo/window/widgets/IProductDisplayInfo';

/**
 * What the rest of the client is allowed to ask of the collectibles (NFT) subsystem: keep the
 * collection counts in step with the furni inventory, and name/describe a product.
 *
 * `HabboCatalog.collectorHub` returns this, and it is the only route into
 * `CollectiblesController` from outside `habbo/catalog/collectibles/`.
 *
 * Name DERIVED: the interface is obfuscated in every tree. It is named after the accessor that
 * hands it out — `HabboCatalog.as::get collectorHub()`, which is not obfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/_SafeCls_2202.as
 */
export interface ICollectorHub
{
    // AS3: _SafeCls_2202.as::itemAddedToInventory()
    itemAddedToInventory(productTypeId: number, itemTypeId: number, isWallItem: boolean): void;

    // AS3: _SafeCls_2202.as::itemRemovedFromInventory()
    itemRemovedFromInventory(productTypeId: number, itemTypeId: number, isWallItem: boolean): void;

    /**
     * The product's display name. AS3 resolves it per product type against the session's furniture
     * data, the badge names, or a `fx_`/`pet.type.` localization key — see
     * `CollectiblesController.as::getProductName()`.
     */
    // AS3: _SafeCls_2202.as::getProductName()
    getProductName(product: IProductDisplayInfo | null): string;

    /**
     * The localized product *category* ("Furniture", "Badge", "Pet"…), from the
     * `product.type.*` keys.
     */
    // AS3: _SafeCls_2202.as::getProductType()
    getProductType(product: IProductDisplayInfo | null): string;
}
