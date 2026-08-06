import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';

/**
 * What every inventory tab's view exposes to the inventory window: the container to host.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/IInventoryView.as
 */
export interface IInventoryView extends IDisposable
{
    // AS3: .../IInventoryView.as::getWindowContainer()
    getWindowContainer(): IWindowContainer | null;
}
