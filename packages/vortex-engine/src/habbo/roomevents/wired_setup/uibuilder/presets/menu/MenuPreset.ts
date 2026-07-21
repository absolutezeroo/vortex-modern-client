import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import {WiredUIPreset} from '../WiredUIPreset';
import type {IMenuElement} from './elements/IMenuElement';
import {MenuItem} from './elements/MenuItem';
import {MenuSpacer} from './elements/MenuSpacer';
import {MenuItemView} from './views/MenuItemView';

/**
 * MenuPreset — the wired dialog's quick (context) menu, opened from the frame's menu button. Clones a
 * row per MenuItem (and a divider per MenuSpacer), sizes itself to the widest row, and shows itself on
 * the desktop below the button, closing on deactivation.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/menu/MenuPreset.as
 */
export class MenuPreset extends WiredUIPreset
{
    // AS3: MenuPreset.as::SPACER
    public static readonly SPACER: IMenuElement = new MenuSpacer();

    // AS3: MenuPreset.as::_container
    private _container: IWindowContainer;

    // AS3: MenuPreset.as::_itemTemplate
    private _itemTemplate: IRegionWindow;

    // AS3: MenuPreset.as::_spacerTemplate
    private _spacerTemplate: IWindow;

    // AS3: MenuPreset.as::_views
    private _views: MenuItemView[];

    // AS3: MenuPreset.as::_menuButton
    private _menuButton: IWindow;

    // AS3: MenuPreset.as::MenuPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, items: IMenuElement[], menuButton: IWindow)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._menuButton = menuButton;
        this._container = wiredStyle.createQuickMenu();

        const list = this.menuList;
        const widthDelta = this._container.width - list.width;
        const heightDelta = this._container.height - list.height;

        this._itemTemplate = list.removeListItem((list as unknown as IWindowContainer).findChildByName('menu_item_template')!) as unknown as IRegionWindow;
        this._spacerTemplate = list.removeListItem((list as unknown as IWindowContainer).findChildByName('spacer_template')!) as unknown as IWindow;
        this._views = [];

        let minWidth = 0;

        for(const element of items)
        {
            if(element instanceof MenuItem)
            {
                const view = new MenuItemView(this, element);

                this._views.push(view);
                list.addListItem(view.window);

                if(view.requestedMinWidth > minWidth)
                {
                    minWidth = view.requestedMinWidth;
                }
            }
            else if(element instanceof MenuSpacer)
            {
                list.addListItem(this._spacerTemplate.clone());
            }
        }

        this._container.width = minWidth + widthDelta + wiredStyle.menuRightOffset;
        this._container.height = list.height + heightDelta;
        this._container.addEventListener('WE_DEACTIVATED', this._onDeactivate);
    }

    // AS3: MenuPreset.as::onDeactivate()
    private _onDeactivate = (_event: WindowEvent): void =>
    {
        this.requestClose();
    };

    // AS3: MenuPreset.as::requestOpen()
    requestOpen(): void
    {
        const desktop = this._roomEvents.windowManager?.getDesktop(1) ?? null;

        if(desktop != null)
        {
            (desktop as unknown as IWindowContainer).addChild(this._container);
        }

        const position = {x: 0, y: 0};

        this._menuButton.getGlobalPosition(position);
        this._container.x = position.x;
        this._container.y = position.y + this._menuButton.height;
        this._container.visible = true;
        this._container.activate();
    }

    // AS3: MenuPreset.as::requestClose()
    requestClose(): void
    {
        const desktop = this._roomEvents.windowManager?.getDesktop(1) ?? null;

        if(desktop != null)
        {
            (desktop as unknown as IWindowContainer).removeChild(this._container);
        }
    }

    // AS3: MenuPreset.as::setSelected()
    setSelected(index: number, value: boolean): void
    {
        this._views[index].selected = value;
    }

    // AS3: MenuPreset.as::getSelected()
    getSelected(index: number): boolean
    {
        return this._views[index].selected;
    }

    // AS3: MenuPreset.as::setDisabled()
    setDisabled(index: number, value: boolean): void
    {
        this._views[index].disabled = value;
    }

    // AS3: MenuPreset.as::getDisabled()
    getDisabled(index: number): boolean
    {
        return this._views[index].disabled;
    }

    // AS3: MenuPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: MenuPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._container.width = width;
    }

    // AS3: MenuPreset.as::hasStaticWidth()
    override hasStaticWidth(): boolean
    {
        return false;
    }

    // AS3: MenuPreset.as::get staticWidth()
    override get staticWidth(): number
    {
        return this._container.width;
    }

    // AS3: MenuPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [];
    }

    // AS3: MenuPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();

        for(const view of this._views)
        {
            view.dispose();
        }

        this._views = null as unknown as MenuItemView[];
        this._container.dispose();
        this._container = null as unknown as IWindowContainer;
        this._itemTemplate.dispose();
        this._itemTemplate = null as unknown as IRegionWindow;
        this._spacerTemplate.dispose();
        this._spacerTemplate = null as unknown as IWindow;
        this._menuButton = null as unknown as IWindow;
    }

    // AS3: MenuPreset.as::get menuList()
    private get menuList(): IItemListWindow
    {
        return (this._container as unknown as IWindowContainer).findChildByName('menu_list') as unknown as IItemListWindow;
    }

    // AS3: MenuPreset.as::get menuItemTemplate()
    get menuItemTemplate(): IRegionWindow
    {
        return this._itemTemplate;
    }
}
