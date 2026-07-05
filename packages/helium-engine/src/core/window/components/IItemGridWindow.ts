import type {IWindow} from '../IWindow';
import type {IIterable} from '../utils/IIterable';
import type {IScrollableWindow} from './IScrollableWindow';

/**
 * Interface for item grid windows.
 *
 * An item grid arranges children in a two-dimensional grid layout
 * with configurable columns, rows, spacing, and scroll support.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IItemGridWindow.as
 */
export interface IItemGridWindow extends IWindow, IScrollableWindow, IIterable
{
    spacing: number;
    verticalSpacing: number;
    scaleToFitItems: boolean;
    autoArrangeItems: boolean;
    resizeOnItemUpdate: boolean;
    shouldRebuildGridOnResize: boolean;
    containerResizeToColumns: boolean;

    readonly numColumns: number;
    readonly numRows: number;
    readonly numGridItems: number;

    addGridItem(item: IWindow): IWindow;

    addGridItemAt(item: IWindow, index: number): IWindow;

    getGridItemAt(index: number): IWindow | null;

    getGridItemByID(id: number): IWindow | null;

    getGridItemByName(name: string): IWindow | null;

    getGridItemByTag(tag: string): IWindow | null;

    getGridItemIndex(item: IWindow): number;

    removeGridItem(item: IWindow): IWindow | null;

    removeGridItemAt(index: number): IWindow | null;

    setGridItemIndex(item: IWindow, index: number): void;

    swapGridItems(a: IWindow, b: IWindow): void;

    swapGridItemsAt(indexA: number, indexB: number): void;

    removeGridItems(): void;

    destroyGridItems(): void;

    rebuildGridStructure(): void;

    populate(items: IWindow[]): void;
}
