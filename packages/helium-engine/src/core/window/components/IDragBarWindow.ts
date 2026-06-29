import type {IInteractiveWindow} from './IInteractiveWindow';

/**
 * Interface for drag bar windows.
 *
 * Provides scrollbar offset values for the draggable lift (thumb)
 * element within a scrollbar.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IDragBarWindow.as
 */
export interface IDragBarWindow extends IInteractiveWindow
{
	scrollbarOffsetX: number;
	scrollbarOffsetY: number;
}
