import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemGrid} from './IItemGrid';

/**
 * A single selectable/draggable item inside an `IItemGrid`.
 *
 * @see sources/win63_version/habbo/catalog/viewer/class_2253.as
 */
export interface IGridItem extends IDisposable
{
    view: IWindowContainer;

    grid: IItemGrid;

    setDraggable(draggable: boolean): void;

    activate(): void;

    deactivate(): void;
}
