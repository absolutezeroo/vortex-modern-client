import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IInteractiveWindow} from './IInteractiveWindow';
import type {IRegionWindow} from './IRegionWindow';
import type {IToolTipWindow} from './IToolTipWindow';
import {ContainerController} from './ContainerController';
import {InteractiveController} from './InteractiveController';
import type {WindowController} from '../WindowController';
import type {WindowEvent} from '../events/WindowEvent';

/**
 * Controller for region windows.
 *
 * Extends ContainerController with interactive tooltip/cursor features
 * by delegating to InteractiveController's static helpers.
 *
 * @see sources/win63_version/com/sulake/core/window/components/RegionController.as
 */
export class RegionController extends ContainerController implements IRegionWindow
{
    protected static readonly KEY_TOOLTIP_CAPTION: string = 'tool_tip_caption';
    protected static readonly DEF_TOOLTIP_CAPTION: string = '';
    protected static readonly KEY_TOOLTIP_DELAY: string = 'tool_tip_delay';
    protected static readonly DEF_TOOLTIP_DELAY: number = 500;
    protected _cursorMap: Map<number, number> | null = null;

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
        id: number = 0
    )
    {
        param |= 1;
        super(name, type, style, param, context, rect, parent, procedure, tags, properties, id);
    }

    protected _toolTipDelay: number = 500;

    public get toolTipDelay(): number
    {
        return this._toolTipDelay;
    }

    public set toolTipDelay(value: number)
    {
        this._toolTipDelay = value;
    }

    protected _toolTipCaption: string = '';

    public get toolTipCaption(): string
    {
        return this._toolTipCaption;
    }

    public set toolTipCaption(value: string)
    {
        this._toolTipCaption = value === null ? '' : value;
    }

    protected _toolTipIsDynamic: boolean = false;

    public get toolTipIsDynamic(): boolean
    {
        return this._toolTipIsDynamic;
    }

    public set toolTipIsDynamic(value: boolean)
    {
        this._toolTipIsDynamic = value;
    }

    private _interactiveCursorDisabled: boolean = false;

    public get interactiveCursorDisabled(): boolean
    {
        return this._interactiveCursorDisabled;
    }

    public set interactiveCursorDisabled(value: boolean)
    {
        this._interactiveCursorDisabled = value;
    }

    public override get properties(): unknown[]
    {
        return InteractiveController.writeInteractiveWindowProperties(this as unknown as IInteractiveWindow, super.properties);
    }

    public override set properties(value: unknown[])
    {
        InteractiveController.readInteractiveWindowProperties(this as unknown as IInteractiveWindow, value);
        super.properties = value;
    }

    public showToolTip(_toolTip: IToolTipWindow): void
    {
        // No-op per AS3
    }

    public hideToolTip(): void
    {
        // No-op per AS3
    }

    /**
	 * Sets the mouse cursor type for a given state.
	 *
	 * @returns The previous cursor type for that state
	 */
    public setMouseCursorForState(state: number, cursor: number): number
    {
        if(!this._cursorMap)
        {
            this._cursorMap = new Map();
        }

        const previous = this._cursorMap.get(state) ?? 0;

        if(cursor === 0 || cursor === -1)
        {
            this._cursorMap.delete(state);
        }
        else
        {
            this._cursorMap.set(state, cursor);
        }

        return previous;
    }

    /**
	 * Gets the mouse cursor type for a given state.
	 */
    public getMouseCursorByState(state: number): number
    {
        if(this.testStateFlag(32))
        {
            return 1;
        }

        if(!this._cursorMap)
        {
            return 0;
        }

        return this._cursorMap.get(state) ?? 0;
    }

    public override update(source: WindowController, event: WindowEvent): boolean
    {
        const result = super.update(source, event);

        if(source === (this as unknown))
        {
            InteractiveController.processInteractiveWindowEvents(this as unknown as IInteractiveWindow, event);
        }

        return result;
    }
}
