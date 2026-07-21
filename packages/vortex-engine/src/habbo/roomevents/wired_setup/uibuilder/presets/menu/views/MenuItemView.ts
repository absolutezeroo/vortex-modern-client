import type {IDisposable} from '@core/runtime/IDisposable';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Util} from '@habbo/roomevents/Util';

import type {MenuPreset} from '../MenuPreset';
import type {MenuItem} from '../elements/MenuItem';

/**
 * MenuItemView — the rendered row for one MenuItem in the quick menu: label, optional checkbox,
 * hover highlight, and disabled dimming. Clicking toggles the checkbox (or closes the menu for plain
 * items) and fires the item's callbacks.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/menu/views/MenuItemView.as
 */
export class MenuItemView implements IDisposable
{
    // AS3: MenuItemView.as::_disposed
    private _disposed: boolean = false;

    // AS3: MenuItemView.as::_window
    private _window: IRegionWindow;

    // AS3: MenuItemView.as::_menu
    private _menu: MenuPreset;

    // AS3: MenuItemView.as::_item
    private _item: MenuItem;

    // AS3: MenuItemView.as::_hovered
    private _hovered: boolean = false;

    // AS3: MenuItemView.as::_checkboxHovered
    private _checkboxHovered: boolean = false;

    // AS3: MenuItemView.as::_disabled
    private _disabled: boolean = false;

    // AS3: MenuItemView.as::_ignoreEvents
    private _ignoreEvents: boolean = false;

    // AS3: MenuItemView.as::MenuItemView()
    constructor(menu: MenuPreset, item: MenuItem)
    {
        this._menu = menu;
        this._item = item;
        this._window = menu.menuItemTemplate.clone() as unknown as IRegionWindow;
        this.textWindow.text = item.name;
        this.checkboxWindow.visible = item.hasCheckbox;

        if(item.tooltip != null && item.tooltip.length > 0)
        {
            this._window.toolTipCaption = item.tooltip;
        }

        this._window.addEventListener('WME_OVER', this._onHover);
        this._window.addEventListener('WME_OUT', this._onHoverEnd);
        this._window.addEventListener('WME_CLICK', this._onClick);
        this.checkboxWindow.addEventListener('WME_OVER', this._onCheckboxHover);
        this.checkboxWindow.addEventListener('WME_OUT', this._onCheckboxHoverEnd);
        this.checkboxWindow.addEventListener('WE_SELECTED', this._onSelectedChange);
        this.checkboxWindow.addEventListener('WE_UNSELECTED', this._onSelectedChange);
        this.updateUI();
    }

    // AS3: MenuItemView.as::onSelectedChange()
    private _onSelectedChange = (_event: WindowEvent): void =>
    {
        if(this._ignoreEvents)
        {
            return;
        }

        if(this._item.selectedChange != null)
        {
            this._item.selectedChange(this.checkboxWindow.isSelected);
        }
    };

    // AS3: MenuItemView.as::onClick()
    private _onClick = (_event: WindowMouseEvent): void =>
    {
        if(this._disabled)
        {
            return;
        }

        if(this._item.hasCheckbox)
        {
            this.selected = !this.selected;
        }

        if(this._item.onClick != null)
        {
            this._item.onClick();
        }

        if(!this._item.hasCheckbox)
        {
            this._menu.requestClose();
        }
    };

    // AS3: MenuItemView.as::onHoverEnd()
    private _onHoverEnd = (_event: WindowMouseEvent): void =>
    {
        this._hovered = false;
        this.updateUI();
    };

    // AS3: MenuItemView.as::onHover()
    private _onHover = (_event: WindowMouseEvent): void =>
    {
        this._hovered = true;
        this.updateUI();
    };

    // AS3: MenuItemView.as::onCheckboxHoverEnd()
    private _onCheckboxHoverEnd = (_event: WindowMouseEvent): void =>
    {
        this._checkboxHovered = false;
        this.updateUI();
    };

    // AS3: MenuItemView.as::onCheckboxHover()
    private _onCheckboxHover = (_event: WindowMouseEvent): void =>
    {
        this._checkboxHovered = true;
        this.updateUI();
    };

    // AS3: MenuItemView.as::updateUI()
    private updateUI(): void
    {
        this._window.background = (this._hovered || this._checkboxHovered) && !this._disabled;
        Util.disableSection(this._window, this._disabled);
    }

    // AS3: MenuItemView.as::get selected()
    get selected(): boolean
    {
        if(this._item.hasCheckbox)
        {
            return this.checkboxWindow.isSelected;
        }

        return false;
    }

    // AS3: MenuItemView.as::set selected()
    set selected(value: boolean)
    {
        this._ignoreEvents = true;

        if(this._item.hasCheckbox)
        {
            if(value)
            {
                this.checkboxWindow.select();
            }
            else
            {
                this.checkboxWindow.unselect();
            }

            if(this._item.selectedChange != null)
            {
                this._item.selectedChange(this.checkboxWindow.isSelected);
            }

            if(this._item.onClick != null)
            {
                this._item.onClick();
            }
        }

        this._ignoreEvents = false;
    }

    // AS3: MenuItemView.as::get disabled()
    get disabled(): boolean
    {
        return this._disabled;
    }

    // AS3: MenuItemView.as::set disabled()
    set disabled(value: boolean)
    {
        this._disabled = value;
        this.updateUI();
    }

    // AS3: MenuItemView.as::get requestedMinWidth()
    get requestedMinWidth(): number
    {
        return this.textWindow.x + this.textWindow.width;
    }

    // AS3: MenuItemView.as::get menuItem()
    get menuItem(): MenuItem
    {
        return this._item;
    }

    // AS3: MenuItemView.as::get window()
    get window(): IRegionWindow
    {
        return this._window;
    }

    // AS3: MenuItemView.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._window = null as unknown as IRegionWindow;
        this._menu = null as unknown as MenuPreset;
        this._item = null as unknown as MenuItem;
        this._disposed = true;
    }

    // AS3: MenuItemView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: MenuItemView.as::get textWindow()
    private get textWindow(): ITextWindow
    {
        return this._window.findChildByName('text') as unknown as ITextWindow;
    }

    // AS3: MenuItemView.as::get checkboxWindow()
    private get checkboxWindow(): ISelectableWindow
    {
        return this._window.findChildByName('checkbox') as unknown as ISelectableWindow;
    }
}
