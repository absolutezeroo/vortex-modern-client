/**
 * ProductImageUtility — the icon a notification bubble illustrates a product with.
 *
 * Three product types, three different sources: floor furniture renders through the room engine,
 * wall items either render or fall back to one of three fixed room-material icons, and an avatar
 * effect uses a per-effect icon out of the inventory's asset library.
 *
 * It implements `IGetImageListener` only to satisfy `getFurnitureIcon()`/`getWallItemIcon()`,
 * which take one. Both callbacks are empty in AS3 as well: a render that is not already cached
 * simply yields no icon rather than arriving late.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/utils/ProductImageUtility.as
 */
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {IHabboInventory} from '@habbo/inventory/IHabboInventory';
import type {BitmapDataAsset} from '@core/assets/BitmapDataAsset';
import type {Component} from '@core/runtime';
import {Logger} from '@core/utils/Logger';

const logger = Logger.getLogger('habbo.notifications.utils.ProductImageUtility');

export class ProductImageUtility implements IGetImageListener
{
    /**
     * The three wall-item type ids that are room materials rather than furniture.
     *
     * AS3 hard-codes them inside `tempCategoryMapping()` — the name is its own admission that
     * this is a stopgap for a category the wire does not carry.
     */
    // AS3: ProductImageUtility.as::tempCategoryMapping()
    private static readonly TYPE_ID_WALLPAPER: number = 3001;
    // AS3: ProductImageUtility.as::tempCategoryMapping()
    private static readonly TYPE_ID_FLOOR: number = 3002;
    // AS3: ProductImageUtility.as::tempCategoryMapping()
    private static readonly TYPE_ID_LANDSCAPE: number = 4057;

    // AS3: ProductImageUtility.as::_roomEngine
    private _roomEngine: IRoomEngine | null;

    // AS3: ProductImageUtility.as::_inventory
    private _inventory: IHabboInventory | null;

    // AS3: ProductImageUtility.as::ProductImageUtility()
    constructor(roomEngine: IRoomEngine | null, inventory: IHabboInventory | null)
    {
        this._roomEngine = roomEngine;
        this._inventory = inventory;
    }

    /**
     * The icon for one product, or null when there is none to show.
     *
     * AS3 clones every library bitmap it returns, because assigning a BitmapData transfers
     * ownership in Flash. Nothing here takes ownership of an `ImageBitmap`, so the library's own
     * is handed back — the same call `FurniModel.createGroupItem()` makes for the same icons.
     */
    // AS3: ProductImageUtility.as::getProductImage()
    public getProductImage(productType: string, typeId: number, extraParam: string): ImageBitmap | null
    {
        switch(productType)
        {
            case 's':
                return this._roomEngine?.getFurnitureIcon(typeId, this)?.data ?? null;

            case 'i':
                return this.getWallProductImage(typeId, extraParam);

            case 'e':
                return this.getLibraryIcon(`fx_icon_${typeId}`);

            default:
                logger.warn(`Can not yet handle this type of product: ${productType}`);

                return null;
        }
    }

    /**
     * TS-only: AS3 inlines this as the `"i"` arm of `getProductImage()`'s switch, through a
     * `tempCategoryMapping()` that returns 1..4 and a second switch on `result - 2`.
     */
    // AS3: ProductImageUtility.as::getProductImage() (the `"i"` case)
    private getWallProductImage(typeId: number, extraParam: string): ImageBitmap | null
    {
        switch(typeId)
        {
            case ProductImageUtility.TYPE_ID_WALLPAPER:
                return this.getLibraryIcon('inventory_furni_icon_wallpaper');

            case ProductImageUtility.TYPE_ID_FLOOR:
                return this.getLibraryIcon('inventory_furni_icon_floor');

            case ProductImageUtility.TYPE_ID_LANDSCAPE:
                return this.getLibraryIcon('inventory_furni_icon_landscape');

            default:
                return this._roomEngine?.getWallItemIcon(typeId, this, extraParam)?.data ?? null;
        }
    }

    /**
     * TS-only: the three-times-repeated library lookup AS3 writes out per case.
     *
     * The `_png` suffix AS3's asset names carry is dropped: this port's asset keys are the
     * shipped filename without it.
     */
    // TS-only: no AS3 counterpart; the three-times-repeated lookup AS3 writes out per case.
    private getLibraryIcon(assetName: string): ImageBitmap | null
    {
        // AS3 casts to the Component base here too (`_inventory as _SafeCls_50`), because
        // IHabboInventory does not declare the asset library either.
        const library = (this._inventory as unknown as Component | null)?.assets ?? null;
        const asset = library?.getAssetByName(assetName) as BitmapDataAsset | null;

        return (asset?.content as ImageBitmap | null) ?? null;
    }

    // AS3: ProductImageUtility.as::imageReady() — empty there too.
    public imageReady(_id: number, _data: ImageBitmap | null): void
    {
    }

    // AS3: ProductImageUtility.as::imageFailed() — empty there too.
    public imageFailed(_id: number): void
    {
    }

    // AS3: ProductImageUtility.as::dispose()
    public dispose(): void
    {
        this._roomEngine = null;
        this._inventory = null;
    }
}
