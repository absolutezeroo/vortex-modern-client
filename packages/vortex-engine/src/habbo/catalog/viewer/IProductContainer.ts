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
    // AS3: sources/win63_version/habbo/catalog/viewer/class_2557.as::initProductIcon()
    initProductIcon(roomEngine: IRoomEngine, stuffData?: unknown | null): void;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_2557.as::activate()
    activate(): void;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_2557.as::get products()
    readonly products: IProduct[];

    // AS3: sources/win63_version/habbo/catalog/viewer/class_2557.as::get firstProduct()
    readonly firstProduct: IProduct | null;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_2557.as::get view()
    view: IWindowContainer;

    grid: IItemGrid;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_2557.as::setClubIconLevel()
    setClubIconLevel(clubLevel: number): void;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_2557.as::get offer()
    readonly offer: IPurchasableOffer;
}
