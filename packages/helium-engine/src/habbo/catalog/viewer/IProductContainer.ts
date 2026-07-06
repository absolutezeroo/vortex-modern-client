import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IPurchasableOffer} from '../IPurchasableOffer';
import type {IItemGrid} from './IItemGrid';
import type {IProduct} from './IProduct';

/**
 * Groups the product(s) backing a single offer's grid item (single/multi/bundle/furni).
 *
 * @see sources/win63_version/habbo/catalog/viewer/class_2557.as
 */
export interface IProductContainer extends IDisposable
{
    initProductIcon(roomEngine: IRoomEngine, stuffData?: unknown | null): void;

    activate(): void;

    readonly products: IProduct[];

    readonly firstProduct: IProduct | null;

    view: IWindowContainer;

    grid: IItemGrid;

    setClubIconLevel(clubLevel: number): void;

    readonly offer: IPurchasableOffer;
}
