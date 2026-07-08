import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ILandingViewWidget} from '../interfaces/ILandingViewWidget';
import type {IResizeAwareWidget} from '../interfaces/IResizeAwareWidget';
import type {ISettingsAwareWidget} from '../interfaces/ISettingsAwareWidget';
import type {IDisableableWidget} from '../interfaces/IDisableableWidget';
import type {CommonWidgetSettings} from './CommonWidgetSettings';

function isSettingsAwareWidget(widget: ILandingViewWidget): widget is ILandingViewWidget & ISettingsAwareWidget
{
    return 'settings' in widget;
}

function isResizeAwareWidget(widget: ILandingViewWidget): widget is ILandingViewWidget & IResizeAwareWidget
{
    return typeof (widget as Partial<IResizeAwareWidget>).windowResized === 'function';
}

function isDisableableWidget(widget: ILandingViewWidget): widget is ILandingViewWidget & IDisableableWidget
{
    return typeof (widget as Partial<IDisableableWidget>).disable === 'function';
}

/**
 * Binds one `ILandingViewWidget` to either a named XML placeholder (fixed
 * widgets) or a dynamic-grid slot container (the 6 dynamic slots), and
 * lazily initializes it on first `refresh()`.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainer.as
 */
export class WidgetContainer implements IDisposable
{
    private _widget: ILandingViewWidget | null;
    private _placeholderName: string | null;
    private _dynamicSlotContainer: IWindowContainer | null;
    private _initialized: boolean = false;
    private _settings: CommonWidgetSettings | null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainer.as::WidgetContainer()
    constructor(
        widget: ILandingViewWidget,
        placeholderName: string | null,
        settings: CommonWidgetSettings | null,
        dynamicSlotContainer: IWindowContainer | null = null
    )
    {
        this._widget = widget;
        this._placeholderName = placeholderName;
        this._settings = settings;
        this._dynamicSlotContainer = dynamicSlotContainer;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainer.as::dispose()
    dispose(): void
    {
        if(this._widget)
        {
            this._widget.dispose();
            this._widget = null;
        }

        this._settings = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainer.as::get disposed()
    get disposed(): boolean
    {
        return this._widget === null && this._settings === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainer.as::refresh()
    refresh(root: IWindowContainer): void
    {
        const contentBackground = root.findChildByName('content_background') as IWindowContainer | null;

        if(!this._initialized)
        {
            this._initialized = true;

            if(this._placeholderName !== null)
            {
                if(!contentBackground) return;

                const placeholder = contentBackground.getChildByName(this._placeholderName);

                if(!placeholder) return;
                if(!this._widget) return;

                this._widget.initialize();

                const widgetContainer = this._widget.container;

                if(widgetContainer)
                {
                    contentBackground.addChildAt(widgetContainer, contentBackground.getChildIndex(placeholder));
                    widgetContainer.x = placeholder.x;
                    widgetContainer.y = placeholder.y;
                }

                contentBackground.removeChild(placeholder);
                placeholder.dispose();
            }
            else
            {
                if(!(this._dynamicSlotContainer !== null && this._widget !== null)) return;

                this._widget.initialize();

                if(this._widget.container)
                {
                    this._dynamicSlotContainer.addChild(this._widget.container);
                }
            }
        }

        if(this._widget && this._widget.container !== null)
        {
            if(isSettingsAwareWidget(this._widget) && this._settings !== null)
            {
                this._widget.settings = this._settings;
            }

            this._widget.refresh();
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainer.as::get container()
    get container(): IWindow | null
    {
        return this._widget ? this._widget.container : null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainer.as::windowResized()
    windowResized(): void
    {
        if(this._widget !== null && this._widget.container !== null && isResizeAwareWidget(this._widget))
        {
            this._widget.windowResized();
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/WidgetContainer.as::disable()
    disable(): void
    {
        if(this._widget !== null && this._widget.container !== null && isDisableableWidget(this._widget))
        {
            this._widget.disable();
        }
    }
}
