import type {IWindow} from './IWindow';
import type {IIterable} from './utils/IIterable';

/**
 * Container window interface.
 *
 * Extends IWindow with child management: add, remove, find, group, iteration.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/IWindowContainer.as
 */
export interface IWindowContainer extends IWindow, IIterable
{
	readonly numChildren: number;

	addChild(child: IWindow): IWindow;

	addChildAt(child: IWindow, index: number): IWindow;

	getChildAt(index: number): IWindow | null;

	getChildByID(id: number): IWindow | null;

	getChildByTag(tag: string): IWindow | null;

	getChildByName(name: string): IWindow | null;

	getChildIndex(child: IWindow): number;

	findChildByTag(tag: string): IWindow | null;

	findChildByName(name: string): IWindow | null;

	enableLookupCache(): void;

	removeChild(child: IWindow): IWindow | null;

	removeChildAt(index: number): IWindow | null;

	setChildIndex(child: IWindow, index: number): void;

	swapChildren(a: IWindow, b: IWindow): void;

	swapChildrenAt(indexA: number, indexB: number): void;

	groupChildrenWithID(id: number, result: IWindow[], depth?: number): number;

	groupChildrenWithTag(tag: string, result: IWindow[], depth?: number): number;

	getChildUnderPoint(point: { x: number; y: number }): IWindow | null;

	groupChildrenUnderPoint(point: { x: number; y: number }, result: IWindow[]): void;
}
