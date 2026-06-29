import type {IInteractiveWindow} from './IInteractiveWindow';

/**
 * Interface for drop menu windows.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IDropMenuWindow.as
 */
export interface IDropMenuWindow extends IInteractiveWindow
{
	selection: number;
	readonly numMenuItems: number;

	populate(items: unknown[]): void;

	populateWithStrings(items: string[]): void;

	enumerateSelection(): string[];
}
