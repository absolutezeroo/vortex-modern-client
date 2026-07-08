import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ILandingViewWidget} from '../interfaces/ILandingViewWidget';
import type {ISlotAwareWidget} from '../interfaces/ISlotAwareWidget';
import type {ISettingsAwareWidget} from '../interfaces/ISettingsAwareWidget';
import type {IConfigurableWidget} from '../interfaces/IConfigurableWidget';
import type {IDisableableWidget} from '../interfaces/IDisableableWidget';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IElementHandler} from '../interfaces/elements/IElementHandler';
import type {ILayoutNameProvider} from '../interfaces/elements/ILayoutNameProvider';
import type {IFloatableElementHandler} from '../interfaces/elements/IFloatableElementHandler';
import type {IDisableableElementHandler} from '../interfaces/elements/IDisableableElementHandler';
import type {HabboLandingView} from '../HabboLandingView';
import type {CommonWidgetSettings} from '../layout/CommonWidgetSettings';
import {ElementHandlerFactory} from './elements/ElementHandlerFactory';
import {TitleElementHandler} from './elements/TitleElementHandler';
import {WidgetContainerLayout} from '../layout/WidgetContainerLayout';

function hasLayoutName(handler: IElementHandler): handler is IElementHandler & ILayoutNameProvider
{
    return 'layoutName' in handler;
}

function isFloatableElementHandler(handler: IElementHandler): handler is IElementHandler & IFloatableElementHandler
{
    return typeof (handler as Partial<IFloatableElementHandler>).isFloating === 'function';
}

function isDisableableElementHandler(handler: IElementHandler): handler is IElementHandler & IDisableableElementHandler
{
    return typeof (handler as Partial<IDisableableElementHandler>).disable === 'function';
}

function isDisposableElementHandler(handler: IElementHandler): handler is IElementHandler & IDisposable
{
    return typeof (handler as Partial<IDisposable>).dispose === 'function';
}

/**
 * The composable "generic" widget - builds its content from a
 * `landing.view.<slot|code>.conf` semicolon-delimited spec, each entry
 * instantiating an `IElementHandler` via `ElementHandlerFactory` and laying
 * it into the widget's scrollable item list (or floating, e.g. a title).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/GenericWidget.as
 */
export class GenericWidget implements ILandingViewWidget, ISlotAwareWidget, ISettingsAwareWidget, IConfigurableWidget, IDisableableWidget
{
    private _landingView: HabboLandingView | null;
    private _container: IWindowContainer | null = null;
    private _slot: number = 0;
    private _configurationCode: string | null = null;
    private _elements: Map<string, IElementHandler> = new Map();

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/GenericWidget.as::GenericWidget()
    constructor(landingView: HabboLandingView)
    {
        this._landingView = landingView;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/GenericWidget.as::configureLayout()
    static configureLayout(landingView: HabboLandingView, slot: number, configurationCode: string | null, container: IWindowContainer): void
    {
        const layoutSpec = GenericWidget.getConf(landingView, slot, configurationCode, 'layout');
        const entries = layoutSpec.split(';');
        const bitmap = container.findChildByName('bitmap') as IStaticBitmapWrapperWindow | null;
        const contentContainer = container.findChildByName('content_container');

        if(contentContainer)
        {
            contentContainer.x = GenericWidget.isWideSlot(slot) ? 230 : 0;
        }

        container.width = GenericWidget.isWideSlot(slot) ? landingView.dynamicLayoutLeftPaneWidth : landingView.dynamicLayoutRightPaneWidth;

        for(const entry of entries)
        {
            const parts = entry.split(',');
            const key = parts[0];
            const value = parts[1];

            switch(key)
            {
                case 'bitmap.uri':
                    if(bitmap) bitmap.assetUri = value;
                    break;
                case 'bitmap.width':
                    if(bitmap) bitmap.width = parseInt(value, 10);
                    break;
                case 'bitmap.height':
                    if(bitmap) bitmap.height = parseInt(value, 10);
                    break;
                case 'bitmap.x':
                    if(bitmap) bitmap.x = parseInt(value, 10);
                    break;
                case 'bitmap.y':
                    if(bitmap) bitmap.y = parseInt(value, 10);
                    break;
                case 'content.x':
                    if(contentContainer) contentContainer.x = parseInt(value, 10);
                    break;
                case 'content.y':
                    if(contentContainer) contentContainer.y = parseInt(value, 10);
                    break;
                case 'content.width':
                    if(contentContainer) contentContainer.width = parseInt(value, 10);
                    break;
                case 'container.height':
                    container.height = Math.max(parseInt(value, 10), container.height);
                    break;
            }
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/GenericWidget.as::getConf()
    private static getConf(landingView: HabboLandingView, slot: number, configurationCode: string | null, suffix: string): string
    {
        const key = configurationCode !== null
            ? `landing.view.${configurationCode}.${suffix}`
            : `landing.view.dynamic.slot.${slot}.${suffix}`;

        return landingView.getProperty(key);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/GenericWidget.as::isWideSlot()
    private static isWideSlot(slot: number): boolean
    {
        return slot !== 3 && slot !== 5;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/GenericWidget.as::set slot()
    set slot(value: number)
    {
        this._slot = value;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/GenericWidget.as::get configurationCode()
    get configurationCode(): string
    {
        return this._configurationCode ?? '';
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/GenericWidget.as::set configurationCode()
    set configurationCode(value: string)
    {
        this._configurationCode = value;
    }

    get container(): IWindow | null
    {
        return this._container;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/GenericWidget.as::dispose()
    dispose(): void
    {
        this._landingView = null;
        this._container = null;

        for(const element of this._elements.values())
        {
            if(isDisposableElementHandler(element))
            {
                element.dispose();
            }
        }

        this._elements.clear();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/GenericWidget.as::initialize()
    initialize(): void
    {
        this._container = this._landingView!.getXmlWindow('generic_widget') as IWindowContainer | null;

        this.configureContentColumn();

        if(this._container)
        {
            GenericWidget.configureLayout(this._landingView!, this._slot, this._configurationCode, this._container);
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/GenericWidget.as::getElementByName()
    getElementByName(name: string): IElementHandler | null
    {
        return this._elements.get(name) ?? null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/GenericWidget.as::configureContentColumn()
    private configureContentColumn(): void
    {
        if(!this._landingView || !this._container) return;

        const confSpec = GenericWidget.getConf(this._landingView, this._slot, this._configurationCode, 'conf');

        if(confSpec === '') return;

        const entries = confSpec.split(';');
        const contentContainer = this._container.findChildByName('content_container') as IItemListWindow | null;

        for(const entry of entries)
        {
            const parts = entry.split(',');
            const type = parts[0];
            const handler = ElementHandlerFactory.createHandler(type);

            if(!handler) continue;

            const layoutName = hasLayoutName(handler) ? handler.layoutName : `element_${type}`;

            let elementWindow: IWindow | null;

            try
            {
                elementWindow = this._landingView.getXmlWindow(layoutName);
            }
            catch
            {
                return;
            }

            if(!elementWindow) return;

            handler.initialize(this._landingView, elementWindow, parts, this);
            this._elements.set(type, handler);

            const isFloating = isFloatableElementHandler(handler) && handler.isFloating(GenericWidget.isWideSlot(this._slot));

            if(isFloating)
            {
                if(handler instanceof TitleElementHandler)
                {
                    elementWindow.width = GenericWidget.isWideSlot(this._slot)
                        ? this._landingView.dynamicLayoutLeftPaneWidth
                        : this._landingView.dynamicLayoutRightPaneWidth;
                }

                this._container.addChild(elementWindow);
            }
            else
            {
                contentContainer?.addListItem(elementWindow);
            }
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/GenericWidget.as::refresh()
    refresh(): void
    {
        for(const element of this._elements.values())
        {
            element.refresh();
        }
    }

    get disposed(): boolean
    {
        return this._landingView === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/GenericWidget.as::set settings()
    set settings(value: CommonWidgetSettings)
    {
        if(this._container) WidgetContainerLayout.applyCommonWidgetSettings(this._container, value);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/GenericWidget.as::disable()
    disable(): void
    {
        for(const element of this._elements.values())
        {
            if(isDisableableElementHandler(element))
            {
                element.disable();
            }
        }
    }
}
