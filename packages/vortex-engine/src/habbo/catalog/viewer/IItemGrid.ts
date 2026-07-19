import type {IGridItem} from './IGridItem';

/**
 * Owner of a set of `IGridItem`s (selection + drag-and-drop coordination).
 *
 * @see sources/win63_version/habbo/catalog/viewer/IItemGrid.as
 */
export interface IItemGrid
{
    select(item: IGridItem, selected: boolean): void;

    startDragAndDrop(item: IGridItem): boolean;

    dispose(): void;
}
