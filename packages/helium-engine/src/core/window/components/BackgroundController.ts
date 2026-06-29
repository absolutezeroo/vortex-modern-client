import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IIterator} from '../utils/IIterator';
import {WindowController} from '../WindowController';
import {WindowEvent} from '../events/WindowEvent';
import {ContainerIterator} from '../iterators/ContainerIterator';

/**
 * Controller for background windows.
 *
 * A simple visual element that renders a solid background color
 * or styled background fill. Sets background=true and color=white
 * by default.
 *
 * @see sources/win63_version/com/sulake/core/window/components/BackgroundController.as
 */
export class BackgroundController extends WindowController
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
		super(name, type, style, param, context, rect, parent, procedure, tags, properties, id, dynamicStyle);

		this.background = true;
		this.color = 0xFFFFFFFF;
	}

	public iterator(): IIterator
	{
		return new ContainerIterator(this._children ?? []);
	}
}
