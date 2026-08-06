import type {IGridItem} from './IGridItem';

/**
 * Owner of a set of `IGridItem`s (selection + drag-and-drop coordination).
 *
 * @see sources/win63_version/habbo/catalog/viewer/IItemGrid.as
 */
export interface IItemGrid
{
    // AS3: sources/win63_version/habbo/catalog/viewer/IItemGrid.as::select()
    select(item: IGridItem, selected: boolean): void;

    // AS3: sources/win63_version/habbo/catalog/viewer/IItemGrid.as::startDragAndDrop()
    startDragAndDrop(item: IGridItem): boolean;

    // AS3: sources/win63_version/habbo/catalog/viewer/IItemGrid.as::dispose()
    dispose(): void;
}
