import type {ITextWindow} from './ITextWindow';
import type {IInteractiveWindow} from './IInteractiveWindow';

/**
 * Interface for editable text field windows.
 *
 * Extends ITextWindow with input-specific functionality: editable, selectable,
 * password display, focus management, and selection.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/ITextFieldWindow.as
 */
export interface ITextFieldWindow extends ITextWindow, IInteractiveWindow
{
	editable: boolean;
	selectable: boolean;
	displayAsPassword: boolean;
	readonly focused: boolean;
	readonly selectionBeginIndex: number;
	readonly selectionEndIndex: number;
	displayRaw: boolean;

	setSelection(beginIndex: number, endIndex: number): void;

	requestChangeEvent(): void;

	getWordAt(x: number, y: number): string;
}
