import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import {InteractiveController} from './InteractiveController';
import type {WindowEvent} from '../events/WindowEvent';

/**
 * Controller for close button windows.
 *
 * A close button is an interactive element typically placed in a
 * frame header to trigger window close events.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/CloseButtonController.as
 */
export class CloseButtonController extends InteractiveController
{
    constructor(
        name: string,
        type: number,
        style: number,
        param: number,
        context: IWindowContext,
        rect: { x: number; y: number; width: number; height: number },
        parent: IWindow | null = null,
        procedure: ((event: WindowEvent, window: IWindow) => void) | null = null,
        tags: string[] | null = null,
        properties: unknown[] | null = null,
        id: number = 0,
        dynamicStyle: string = ''
    )
    {
        super(name, type, style, param, context, rect, parent, procedure, tags, properties, id);
    }
}
