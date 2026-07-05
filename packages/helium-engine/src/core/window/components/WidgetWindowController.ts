import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IWidgetFactory} from '../IWidgetFactory';
import type {IIterator} from '../utils/IIterator';
import type {IWidgetWindow} from './IWidgetWindow';
import {WindowController} from '../WindowController';
import type {WindowEvent} from '../events/WindowEvent';
import type {PropertyStruct} from '../utils/PropertyStruct';

/**
 * Controller for widget windows.
 *
 * Hosts an IWidget that provides custom rendering and behavior.
 * The widget type is configured through properties and created via
 * the context's widget factory.
 *
 * When the `widget_type` property is set, the controller uses the
 * widget factory to create the appropriate widget, which then builds
 * its own window tree and sets it as rootWindow.
 *
 * @see sources/win63_version/core/window/components/WidgetWindowController.as
 */
export class WidgetWindowController extends WindowController implements IWidgetWindow
{
    private _widgetFactory: IWidgetFactory | null = null;
    private _widgetType: string = '';

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
        super(name, type, style, param, context, rect, parent, procedure, tags, properties, id);

        this._widgetFactory = context.getWidgetFactory();
    }

    private _widget: unknown = null;

    /**
	 * The hosted widget.
	 */
    public get widget(): unknown
    {
        return this._widget;
    }

    /**
	 * The root window of the widget.
	 */
    public get rootWindow(): IWindow | null
    {
        return this.getChildAt(0);
    }

    public set rootWindow(value: IWindow | null)
    {
        this.removeChildAt(0);

        if(value === null)
        {
            return;
        }

        this.addChild(value);

        if(value.tags.indexOf('_EXCLUDE') < 0)
        {
            value.tags.push('_EXCLUDE');
        }
    }

    public override get color(): number
    {
        return super.color;
    }

    public override set color(value: number)
    {
        super.color = value;

        const colorized: IWindow[] = [];
        this.groupChildrenWithTag('_COLORIZE', colorized, -1);

        for(const child of colorized)
        {
            child.color = value;
        }
    }

    public override get properties(): unknown[]
    {
        const props = super.properties;

        props.push(this.createProperty('widget_type', this._widgetType));

        if(this._widget && typeof (this._widget as any).properties !== 'undefined')
        {
            const widgetProps = (this._widget as any).properties as unknown[];

            if(widgetProps)
            {
                for(const wp of widgetProps)
                {
                    props.push(wp);
                }
            }
        }

        return props;
    }

    public override set properties(value: unknown[])
    {
        let widgetTypeChanged = false;

        for(const item of value)
        {
            const prop = item as PropertyStruct;

            if(prop.key === 'widget_type')
            {
                const newType = String(prop.value);

                if(this._widgetType !== newType)
                {
                    // Remove old widget root window
                    this.removeChildAt(0);

                    // Dispose old widget
                    if(this._widget && typeof (this._widget as any).dispose === 'function')
                    {
                        (this._widget as any).dispose();
                    }

                    this._widget = null;
                    this._widgetType = newType;

                    // Create new widget via factory
                    if(this._widgetFactory && newType.length > 0)
                    {
                        this._widget = this._widgetFactory.createWidget(newType, this);
                    }

                    widgetTypeChanged = true;
                }

                break;
            }
        }

        // Delegate remaining properties to the widget
        if(this._widget && typeof (this._widget as any).properties !== 'undefined')
        {
            (this._widget as any).properties = value;
        }

        super.properties = value;
    }

    /**
	 * Returns an iterator from the widget, or an empty iterator.
	 */
    public iterator(): IIterator
    {
        if(this._widget && typeof (this._widget as any).iterator === 'function')
        {
            return (this._widget as any).iterator();
        }

        return {
            next: () => null,
            reset: () =>
            {
            },
            count: () => 0
        };
    }

    public override dispose(): void
    {
        if(!this.disposed)
        {
            if(this._widget && typeof (this._widget as any).dispose === 'function')
            {
                (this._widget as any).dispose();
            }

            this._widget = null;
            this._widgetFactory = null;

            super.dispose();
        }
    }
}
