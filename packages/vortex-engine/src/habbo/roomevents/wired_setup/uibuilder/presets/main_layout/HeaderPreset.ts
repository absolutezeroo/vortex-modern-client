import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';
import {Util} from '@habbo/roomevents/Util';

import type {IWiredTypeHolder} from '../../../IWiredTypeHolder';
import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import {WiredUIPreset} from '../WiredUIPreset';
import type {SimpleListViewPreset} from '../SimpleListViewPreset';

/**
 * HeaderPreset — the base of the wired dialog header: a top element (built by the style subclass) plus
 * an optional centred link button whose caption depends on the button mode (apply snapshot / open in
 * variable menu / view logs).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/main_layout/HeaderPreset.as
 */
export class HeaderPreset extends WiredUIPreset
{
    // AS3: HeaderPreset.as::_SafeStr_10768 (name derived: no link button)
    public static readonly BUTTON_MODE_NONE: number = 0;

    // AS3: HeaderPreset.as::_SafeStr_11319 (name derived: "apply snapshot" link)
    public static readonly BUTTON_MODE_APPLY_SNAPSHOT: number = 1;

    // AS3: HeaderPreset.as::BUTTON_MODE_VARIABLE_MENU
    public static readonly BUTTON_MODE_VARIABLE_MENU: number = 2;

    // AS3: HeaderPreset.as::_SafeStr_10753 (name derived: "view in logs" link)
    public static readonly BUTTON_MODE_WRITE_TO_LOGS: number = 3;

    // AS3: HeaderPreset.as::_buttonMode
    private _buttonMode: number;

    // AS3: HeaderPreset.as::_container
    private _container: IWindowContainer;

    // AS3: HeaderPreset.as::_list
    private _list: SimpleListViewPreset;

    // AS3: HeaderPreset.as::_button
    private _button: WiredUIPreset | null;

    // AS3: HeaderPreset.as::_width
    protected _width: number = 0;

    // AS3: HeaderPreset.as::HeaderPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, name: string, typeHolder: IWiredTypeHolder, buttonMode: number, onApplySnapshot: () => void, onOpenMenu: () => void, onViewLogs: () => void)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._buttonMode = buttonMode;
        this._container = presetManager.createLayout('container_view') as unknown as IWindowContainer;

        const items: WiredUIPreset[] = [];
        const topElement = this.createTopHeaderElement(name, typeHolder);

        items.push(topElement);
        this._button = null;

        if(buttonMode === HeaderPreset.BUTTON_MODE_APPLY_SNAPSHOT)
        {
            this._button = presetManager.createTextualButtonPreset(this.loc('wiredfurni.applysnapshot'), onApplySnapshot);
        }
        else if(buttonMode === HeaderPreset.BUTTON_MODE_VARIABLE_MENU)
        {
            this._button = presetManager.createTextualButtonPreset(this.loc('wiredfurni.view_in_menu'), onOpenMenu);
        }
        else if(buttonMode === HeaderPreset.BUTTON_MODE_WRITE_TO_LOGS)
        {
            this._button = presetManager.createTextualButtonPreset(this.loc('wiredfurni.params.write_to_logs.view'), onViewLogs);
        }

        if(this._button != null)
        {
            this._button = this._button.alignCenter();
            items.push(this._button);
        }

        this._list = presetManager.createSimpleListView(true, items);
        this._container.addChild(this._list.window);
        this._list.window.x = this._wiredStyle.headerMargin;
        this._list.window.y = this._wiredStyle.headerMargin;
    }

    // AS3: HeaderPreset.as::createTopHeaderElement()
    protected createTopHeaderElement(_name: string, _typeHolder: IWiredTypeHolder): WiredUIPreset
    {
        return null as unknown as WiredUIPreset;
    }

    // AS3: HeaderPreset.as::updateName()
    updateName(_name: string): void
    {
    }

    // AS3: HeaderPreset.as::set buttonVisible()
    set buttonVisible(value: boolean)
    {
        if(this._button!.visible !== value)
        {
            this._button!.visible = value;
            this.resizeToWidth(this._width);
        }
    }

    // AS3: HeaderPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: HeaderPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._width = width;

        const bottomMargin = this._wiredStyle.headerMargin + (this._button == null || !this._button.visible ? this._wiredStyle.headerMargin : this._wiredStyle.headerBottomMarginWithLink);

        this._list.resizeToWidth(width - this._wiredStyle.headerMargin * 2);
        this._container.width = width;
        this._container.height = Util.getLowestPointList(this._list.window as unknown as IItemListWindow) + bottomMargin;
    }

    // AS3: HeaderPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [this._list];
    }

    // AS3: HeaderPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as IWindowContainer;
        this._list = null as unknown as SimpleListViewPreset;
    }
}
