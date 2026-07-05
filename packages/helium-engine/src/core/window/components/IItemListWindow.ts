import type {IWindow} from '../IWindow';
import type {IWindowContainer} from '../IWindowContainer';
import type {IScrollableWindow} from './IScrollableWindow';

/**
 * Interface for item list windows.
 *
 * An item list arranges children in a single-axis layout
 * (horizontal or vertical) with optional spacing and scrolling.
 *
 * @see sources/win63_version/com/sulake/core/window/components/IItemListWindow.as
 */
export interface IItemListWindow extends IWindowContainer, IScrollableWindow
{
    autoArrangeItems: boolean;
    spacing: number;
    scaleToFitItems: boolean;
    resizeOnItemUpdate: boolean;
    inverseResizeOnItemUpdate: boolean;
    isPartOfGridWindow: boolean;

    readonly numListItems: number;
    readonly firstListItem: IWindow | null;
    readonly lastListItem: IWindow | null;
    readonly scrollableWindow: IWindow;
    disableAutodrag: boolean;
    enableScrollByDragging: boolean;

    arrangeItems(): void;
    arrangeListItems(): void;

    populate(items: IWindow[]): void;

    stopDragging(): void;

    scrollWithWheel(delta: number): void;

    addListItem(item: IWindow): IWindow;

    addListItemAt(item: IWindow, index: number): IWindow;

    getListItemAt(index: number): IWindow | null;

    getListItemByName(name: string): IWindow | null;

    getListItemByID(id: number): IWindow | null;

    getListItemByTag(tag: string): IWindow | null;

    getListItemIndex(item: IWindow): number;

    removeListItem(item: IWindow): IWindow | null;

    removeListItemAt(index: number): IWindow | null;

    removeListItems(): void;

    destroyListItems(): void;

    setListItemIndex(item: IWindow, index: number): void;

    swapListItems(a: IWindow, b: IWindow): void;

    swapListItemsAt(indexA: number, indexB: number): void;

    groupListItemsWithID(id: number, result: IWindow[], depth?: number): number;

    groupListItemsWithTag(tag: string, result: IWindow[], depth?: number): number;
}
