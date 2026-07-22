import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';

import type {ExpandedVariablePickerView} from '../ExpandedVariablePickerView';
import type {TabButtonConfig} from './TabButtonConfig';

/**
 * TabButtonView — one variable-picker tab button: an icon in a bordered region, recolored on
 * hover/active and dimmed via the icon's blend. Clicking it selects the tab on the parent view.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/newvariablepicker/tabbuttons/TabButtonView.as
 */
export class TabButtonView implements IDisposable
{
    // AS3: TabButtonView.as::SELECTED_BG
    private static readonly SELECTED_BG: number = 14737632;

    // AS3: TabButtonView.as::_SafeStr_10444 (name derived: the selected-state shadow color)
    private static readonly SELECTED_SHADOW: number = 4289374890;

    // AS3: TabButtonView.as::HOVER_BG
    private static readonly HOVER_BG: number = 15724527;

    // AS3: TabButtonView.as::_SafeStr_10409 (name derived: the hover-state shadow color)
    private static readonly HOVER_SHADOW: number = 4291611852;

    // AS3: TabButtonView.as::NONE_BG
    private static readonly NONE_BG: number = 16448250;

    // AS3: TabButtonView.as::NONE_SHADOW
    private static readonly NONE_SHADOW: number = 4292730333;

    // AS3: TabButtonView.as::_parent
    private _parent: ExpandedVariablePickerView;

    // AS3: TabButtonView.as::_window
    private _window: IRegionWindow;

    // AS3: TabButtonView.as::_tabConfig
    private _tabConfig: TabButtonConfig;

    // AS3: TabButtonView.as::_disposed
    private _disposed: boolean = false;

    // AS3: TabButtonView.as::_active
    private _active: boolean = false;

    // AS3: TabButtonView.as::_SafeStr_5943 (name derived: whether the button is hovered)
    private _hovered: boolean = false;

    // AS3: TabButtonView.as::TabButtonView()
    constructor(parent: ExpandedVariablePickerView, tabConfig: TabButtonConfig, width: number)
    {
        this._parent = parent;
        this._tabConfig = tabConfig;
        this._window = parent.tabButtonTemplate.clone() as unknown as IRegionWindow;
        this._window.width = width;
        this._window.toolTipCaption = parent.roomEvents.localization.getLocalization(tabConfig.tooltipCaption);
        this.image.assetUri = tabConfig.assetUri;
        this._window.addEventListener('WME_CLICK', this.onClick);
        this._window.addEventListener('WME_OVER', this.onOver);
        this._window.addEventListener('WME_OUT', this.onOut);
        this.updateColoring();
    }

    // AS3: TabButtonView.as::set active()
    set active(value: boolean)
    {
        this._active = value;
        this.updateColoring();
    }

    // AS3: TabButtonView.as::onClick() — bound handler.
    private onClick = (_event: WindowMouseEvent): void =>
    {
        this._parent.selectTab(this);
    };

    // AS3: TabButtonView.as::onOut() — bound handler.
    private onOut = (_event: WindowMouseEvent): void =>
    {
        this._hovered = false;
        this.updateColoring();
    };

    // AS3: TabButtonView.as::onOver() — bound handler.
    private onOver = (_event: WindowMouseEvent): void =>
    {
        this._hovered = true;
        this.updateColoring();
    };

    // AS3: TabButtonView.as::updateColoring()
    private updateColoring(): void
    {
        if(this._active)
        {
            this.buttonBorder.color = TabButtonView.SELECTED_BG;
            this.buttonShadow.color = TabButtonView.SELECTED_SHADOW;
        }
        else if(this._hovered)
        {
            this.buttonBorder.color = TabButtonView.HOVER_BG;
            this.buttonShadow.color = TabButtonView.HOVER_SHADOW;
        }
        else
        {
            this.buttonBorder.color = TabButtonView.NONE_BG;
            this.buttonShadow.color = TabButtonView.NONE_SHADOW;
        }

        this.image.blend = this._active ? 0.6 : (this._hovered ? 0.5 : 0.4);
    }

    // AS3: TabButtonView.as::get tabConfig()
    get tabConfig(): TabButtonConfig
    {
        return this._tabConfig;
    }

    // AS3: TabButtonView.as::get window()
    get window(): IRegionWindow
    {
        return this._window;
    }

    // AS3: TabButtonView.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._parent = null as unknown as ExpandedVariablePickerView;
        this._window.dispose();
        this._window = null as unknown as IRegionWindow;
        this._tabConfig = null as unknown as TabButtonConfig;
        this._disposed = true;
    }

    // AS3: TabButtonView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: TabButtonView.as::get buttonBorder()
    private get buttonBorder(): IWindowContainer
    {
        return this._window.findChildByName('button_border') as unknown as IWindowContainer;
    }

    // AS3: TabButtonView.as::get buttonShadow()
    private get buttonShadow(): IWindowContainer
    {
        return this._window.findChildByName('button_shadow') as unknown as IWindowContainer;
    }

    // AS3: TabButtonView.as::get image()
    private get image(): IStaticBitmapWrapperWindow
    {
        return this._window.findChildByName('button_img') as unknown as IStaticBitmapWrapperWindow;
    }
}
