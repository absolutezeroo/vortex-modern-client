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
    // AS3: sources/win63_version/habbo/catalog/viewer/class_2253.as::get view()
    view: IWindowContainer;

    grid: IItemGrid;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_2253.as::setDraggable()
    setDraggable(draggable: boolean): void;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_2253.as::activate()
    activate(): void;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_2253.as::deactivate()
    deactivate(): void;
}
