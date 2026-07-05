import type {IWindow} from '../IWindow';
// Forward declaration to avoid circular dependency
import type {IToolTipWindow} from './IToolTipWindow';

/**
 * Interface for interactive windows with tooltip and mouse cursor support.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IInteractiveWindow.as
 */
export interface IInteractiveWindow extends IWindow
{
    toolTipCaption: string;
    toolTipDelay: number;
    toolTipIsDynamic: boolean;
    interactiveCursorDisabled: boolean;

    showToolTip(toolTip: IToolTipWindow): void;

    hideToolTip(): void;

    setMouseCursorForState(state: number, cursor: number): number;

    getMouseCursorByState(state: number): number;
}
