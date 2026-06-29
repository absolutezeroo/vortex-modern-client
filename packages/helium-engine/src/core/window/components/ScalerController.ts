import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IScalerWindow} from './IScalerWindow';
import {InteractiveController} from './InteractiveController';
import {WindowEvent} from '../events/WindowEvent';

/**
 * Controller for scaler windows.
 *
 * A scaler is an interactive element used to resize a parent frame window.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/ScalerController.as
 */
export class ScalerController extends InteractiveController implements IScalerWindow
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
