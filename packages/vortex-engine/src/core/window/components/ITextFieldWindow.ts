import type {ITextWindow} from './ITextWindow';
import type {IInteractiveWindow} from './IInteractiveWindow';
import type {IFocusWindow} from './IFocusWindow';

/**
 * Interface for editable text field windows.
 *
 * Extends ITextWindow with input-specific functionality: editable, selectable,
 * password display, focus management, and selection.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/ITextFieldWindow.as
 */
export interface ITextFieldWindow extends ITextWindow, IInteractiveWindow, IFocusWindow
{
    editable: boolean;
    selectable: boolean;
    displayAsPassword: boolean;
    readonly selectionBeginIndex: number;
    readonly selectionEndIndex: number;
    displayRaw: boolean;

    /**
	 * Character mask applied to typing. See TextController.applyRestrict() for the supported
	 * syntax and for the one place this port differs from Flash (the empty string).
	 */
    // AS3: sources/win63_version/core/window/components/ITextFieldWindow.as::get restrict()
    restrict: string;

    setSelection(beginIndex: number, endIndex: number): void;

    requestChangeEvent(): void;

    getWordAt(x: number, y: number): string;
}
