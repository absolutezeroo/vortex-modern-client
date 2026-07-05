import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IDesktopWindow} from './IDesktopWindow';
import {ActivatorController} from './ActivatorController';
import type {WindowEvent} from '../events/WindowEvent';

/**
 * Desktop controller — the root container for all windows in a context.
 *
 * Extends ActivatorController to manage the active window via the inherited
 * activation system. Provides mouse position tracking and child lookup.
 *
 * @see sources/win63_version/com/sulake/core/window/components/DesktopController.as
 */
export class DesktopController extends ActivatorController implements IDesktopWindow
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
        super(name, type, style, param, context, rect, parent, procedure ?? DesktopController.defaultProcedure, tags, properties, id);
    }

    private _mouseX: number = 0;

    public get mouseX(): number
    {
        return this._mouseX;
    }

    private _mouseY: number = 0;

    public get mouseY(): number
    {
        return this._mouseY;
    }

    public override get host(): IWindow
    {
        return this;
    }

    public override get desktop(): IWindow
    {
        return this;
    }

    private static defaultProcedure(_event: WindowEvent, _window: IWindow): void
    {
        // No-op default procedure
    }

    /**
	 * Returns the currently active window (delegates to getActiveChild).
	 */
    public getActiveWindow(): IWindow
    {
        return this.getActiveChild() ?? this;
    }

    /**
	 * Sets the active window (delegates to setActiveChild).
	 */
    public setActiveWindow(window: IWindow): IWindow
    {
        return this.setActiveChild(window) ?? this;
    }

    public groupParameterFilteredChildrenUnderPoint(
        point: { x: number; y: number },
        result: IWindow[],
        paramFilter: number = 0
    ): void
    {
        super.groupParameterFilteredChildrenUnderPoint(point, result, paramFilter);
    }

    public setDisplayObject(_displayObject: unknown): void
    {
        // No-op in TypeScript port — rendering handled by client layer
    }

    public getDisplayObject(): unknown
    {
        return null;
    }

    /**
	 * Desktop invalidation is a no-op per AS3.
	 */
    public override invalidate(): void
    {
        // No-op
    }

    public override dispose(): void
    {
        if(this._disposed) return;

        super.dispose();
    }
}
