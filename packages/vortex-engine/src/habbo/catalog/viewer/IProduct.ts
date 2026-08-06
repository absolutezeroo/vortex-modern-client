import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import type {IProductData} from '@habbo/session/product/IProductData';
import type {IFurnitureData} from '@habbo/session/furniture/IFurnitureData';
import type {IPurchasableOffer} from '../IPurchasableOffer';
import type {IItemGrid} from './IItemGrid';

/**
 * A single purchasable/renderable product within an offer (furni, badge, effect, etc.).
 *
 * @see sources/win63_version/habbo/catalog/viewer/class_1857.as
 */
export interface IProduct extends IGetImageListener, IDisposable
{
    // AS3: sources/win63_version/habbo/catalog/viewer/class_1857.as::get productType()
    readonly productType: string;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_1857.as::get productClassId()
    readonly productClassId: number;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_1857.as::get extraParam()
    extraParam: string;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_1857.as::get productCount()
    readonly productCount: number;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_1857.as::get productData()
    readonly productData: IProductData | null;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_1857.as::get furnitureData()
    readonly furnitureData: IFurnitureData | null;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_1857.as::get isUniqueLimitedItem()
    readonly isUniqueLimitedItem: boolean;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_1857.as::get isColorable()
    readonly isColorable: boolean;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_1857.as::get uniqueLimitedItemSeriesSize()
    readonly uniqueLimitedItemSeriesSize: number;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_1857.as::get uniqueLimitedItemsLeft()
    uniqueLimitedItemsLeft: number;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_1857.as::initIcon()
    initIcon(
        grid: unknown,
        imageListener?: IGetImageListener | null,
        avatarListener?: IAvatarImageListener | null,
        offer?: IPurchasableOffer | null,
        target?: unknown,
        stuffData?: unknown | null,
        onPreviewImageReady?: ((event: unknown) => void) | null
    ): ImageBitmap | null;

    view: IWindowContainer;

    grid: IItemGrid;
}
