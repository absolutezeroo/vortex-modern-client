import type {IWindow} from '../IWindow';
import type {ISelectableWindow} from './ISelectableWindow';

/**
 * Interface for selector windows that manage mutual exclusion of selectables.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/ISelectorWindow.as
 */
export interface ISelectorWindow extends IWindow
{
	readonly numSelectables: number;

	getSelected(): ISelectableWindow | null;

	setSelected(selectable: ISelectableWindow): void;

	addSelectable(selectable: ISelectableWindow): ISelectableWindow;

	addSelectableAt(selectable: ISelectableWindow, index: number): ISelectableWindow;

	getSelectableAt(index: number): ISelectableWindow | null;

	getSelectableByID(id: number): ISelectableWindow | null;

	getSelectableByTag(tag: string): ISelectableWindow | null;

	getSelectableByName(name: string): ISelectableWindow | null;

	getSelectableIndex(selectable: ISelectableWindow): number;

	removeSelectable(selectable: ISelectableWindow): ISelectableWindow | null;
}
