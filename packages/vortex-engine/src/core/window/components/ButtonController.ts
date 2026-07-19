import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {WindowController} from '../WindowController';
import {InteractiveController} from './InteractiveController';
import type {WindowEvent} from '../events/WindowEvent';

/**
 * Controller for button windows.
 *
 * An interactive component with visual content that responds
 * to mouse events and state changes (normal, hover, pressed, disabled).
 * Syncs caption and blend to its _BTN_TEXT child.
 *
 * @see sources/win63_version/com/sulake/core/window/components/ButtonController.as
 */
export class ButtonController extends InteractiveController
{
    protected static readonly TEXT_FIELD_NAME: string = '_BTN_TEXT';
    protected static readonly CAPTION_BLEND_CHANGE: number = 0.5;

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
        _dynamicStyle: string = ''
    )
    {
        param |= 0x20000;
        super(name, type, style, param, context, rect, parent, procedure, tags, properties, id);
    }

    public override get caption(): string
    {
        return super.caption;
    }

    /**
	 * Sets the caption and syncs text to the _BTN_TEXT child.
	 */
    public override set caption(value: string)
    {
        super.caption = value;

        const textChild = this.getChildByName(ButtonController.TEXT_FIELD_NAME);

        if(textChild !== null)
        {
            textChild.caption = this.caption;
        }
    }

    public override get blend(): number
    {
        return super.blend;
    }

    /**
	 * Sets blend and adjusts the _BTN_TEXT child blend based on disabled state.
	 */
    public override set blend(value: number)
    {
        super.blend = value;

        const textChild = this.getChildByName(ButtonController.TEXT_FIELD_NAME);
        const isDisabled = this.getStateFlag(32);

        if(textChild !== null)
        {
            textChild.blend = isDisabled ? value / 2 : value;
        }
    }

    /**
	 * Handles button-specific events: child resize, enable/disable blend changes.
	 */
    public override update(source: WindowController, event: WindowEvent): boolean
    {
        switch(event.type)
        {
            case 'WE_CHILD_RESIZED':
                this.width = 0;
                break;
            case 'WE_ENABLED':
                try
                {
                    const textChildE = this.getChildByName(ButtonController.TEXT_FIELD_NAME);

                    if(textChildE)
                    {
                        textChildE.blend = textChildE.blend + ButtonController.CAPTION_BLEND_CHANGE;
                    }
                }
                catch (_e)
                {
                    // ignore
                }
                break;
            case 'WE_DISABLED':
                try
                {
                    const textChildD = this.getChildByName(ButtonController.TEXT_FIELD_NAME);

                    if(textChildD)
                    {
                        textChildD.blend = textChildD.blend - ButtonController.CAPTION_BLEND_CHANGE;
                    }
                }
                catch (_e)
                {
                    // ignore
                }
                break;
        }

        return super.update(source, event);
    }
}
