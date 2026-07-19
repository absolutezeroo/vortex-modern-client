import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {ILandingViewWidget} from '../interfaces/ILandingViewWidget';
import type {ISlotAwareWidget} from '../interfaces/ISlotAwareWidget';
import type {IConfigurableWidget} from '../interfaces/IConfigurableWidget';
import type {HabboLandingView} from '../HabboLandingView';
import {CommonWidgetSettings} from '../layout/CommonWidgetSettings';
import {WidgetContainer} from '../layout/WidgetContainer';
import {LandingViewWidgetType} from '../layout/LandingViewWidgetType';
import type {CurrentTimingCodeMessageEventParser} from '@habbo/communication/messages/parser/competition/CurrentTimingCodeMessageEventParser';
import {CurrentTimingCodeMessageEvent} from '@habbo/communication/messages/incoming/competition/CurrentTimingCodeMessageEvent';
import {GetCurrentTimingCodeMessageComposer} from '@habbo/communication/messages/outgoing/competition/GetCurrentTimingCodeMessageComposer';

/**
 * Meta-widget that swaps its inner widget based on a server-pushed
 * scheduling/timing code - used for scheduled/rotating campaign content in
 * a dynamic slot (`landing.view.dynamic.slot.N.conf` is a scheduling string
 * like `2001-01-01 00:00,<widgetType>`).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/WidgetContainerWidget.as
 */
export class WidgetContainerWidget implements ILandingViewWidget, ISlotAwareWidget
{
    private _landingView: HabboLandingView | null;
    private _container: IWindowContainer | null = null;
    private _widgetContainersByCode: Map<string, WidgetContainer> = new Map();
    private _settings: CommonWidgetSettings | null = null;
    private _slot: number = 0;
    private _schedulingStr: string = '';
    private _currentWidgetContainer: WidgetContainer | null = null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/WidgetContainerWidget.as::WidgetContainerWidget()
    constructor(landingView: HabboLandingView)
    {
        this._landingView = landingView;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/WidgetContainerWidget.as::hideChildren()
    static hideChildren(container: IWindowContainer): void
    {
        for(let i = 0; i < container.numChildren; i++)
        {
            const child = container.getChildAt(i);

            if(child) child.visible = false;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/WidgetContainerWidget.as::set slot()
    set slot(value: number)
    {
        this._slot = value;
    }

    get container(): IWindow | null
    {
        return this._container;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/WidgetContainerWidget.as::dispose()
    dispose(): void
    {
        this._landingView = null;
        this._container = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/WidgetContainerWidget.as::initialize()
    initialize(): void
    {
        this._container = this._landingView!.getXmlWindow('widget_container_widget') as IWindowContainer | null;
        this._settings = new CommonWidgetSettings(this._landingView!);

        this._landingView!.communicationManager?.addHabboConnectionMessageEvent(new CurrentTimingCodeMessageEvent(this.onTimingCode));

        this._schedulingStr = this._landingView!.getProperty(`landing.view.dynamic.slot.${this._slot}.conf`);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/WidgetContainerWidget.as::refresh()
    refresh(): void
    {
        this._landingView?.send(new GetCurrentTimingCodeMessageComposer(this._schedulingStr));
    }

    get disposed(): boolean
    {
        return this._landingView === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/WidgetContainerWidget.as::refreshContent()
    private refreshContent(): void
    {
        if(!this._container) return;

        WidgetContainerWidget.hideChildren(this._container);

        if(this._currentWidgetContainer)
        {
            this._currentWidgetContainer.refresh(this._container);

            if(this._currentWidgetContainer.container)
            {
                this._currentWidgetContainer.container.visible = true;
                this._container.height = this._currentWidgetContainer.container.height;
                this._container.width = this._currentWidgetContainer.container.width;
            }
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/WidgetContainerWidget.as::createWidgetContainer()
    private createWidgetContainer(code: string): WidgetContainer | null
    {
        if(!this._landingView || !this._container || !this._settings) return null;

        const widgetType = this._landingView.getProperty(`landing.view.${code}.widget`);
        const widget = LandingViewWidgetType.getWidgetForType(widgetType, this._landingView);

        if(!widget) return null;

        if('slot' in widget)
        {
            (widget as ISlotAwareWidget).slot = this._slot;
        }

        if('configurationCode' in widget)
        {
            (widget as IConfigurableWidget).configurationCode = code;
        }

        const widgetContainer = new WidgetContainer(widget, null, this._settings, this._container);

        this._widgetContainersByCode.set(code, widgetContainer);

        return widgetContainer;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/WidgetContainerWidget.as::onTimingCode()
    private onTimingCode = (event: IMessageEvent): void =>
    {
        const parser = event.parser as CurrentTimingCodeMessageEventParser | null;

        if(!parser || this.disposed) return;

        if(parser.schedulingStr === this._schedulingStr)
        {
            this.switchCurrentWidget(parser.code);
            this.refreshContent();
        }
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/WidgetContainerWidget.as::switchCurrentWidget()
    private switchCurrentWidget(code: string): void
    {
        if(code === '')
        {
            this._currentWidgetContainer = null;
            return;
        }

        const existing = this._widgetContainersByCode.get(code);

        this._currentWidgetContainer = existing ?? this.createWidgetContainer(code);
    }
}
