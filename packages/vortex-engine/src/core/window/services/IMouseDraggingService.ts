import type {IWindow} from '../IWindow';

/**
 * Mouse dragging service interface.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/services/IMouseDraggingService.as
 */
export interface IMouseDraggingService
{
    begin(window: IWindow): void;

    end(window: IWindow): void;
}
