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
    readonly productType: string;

    readonly productClassId: number;

    extraParam: string;

    readonly productCount: number;

    readonly productData: IProductData | null;

    readonly furnitureData: IFurnitureData | null;

    readonly isUniqueLimitedItem: boolean;

    readonly isColorable: boolean;

    readonly uniqueLimitedItemSeriesSize: number;

    uniqueLimitedItemsLeft: number;

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
