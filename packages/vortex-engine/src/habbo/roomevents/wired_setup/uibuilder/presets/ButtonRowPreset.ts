import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import {WiredUIPreset} from './WiredUIPreset';
import type {SimpleListViewPreset} from './SimpleListViewPreset';

/**
 * ButtonRowPreset — a horizontal row of buttons laid out by a SimpleListView (button-row spacing),
 * hosted in a growing container.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/ButtonRowPreset.as
 */
export class ButtonRowPreset extends WiredUIPreset
{
    // AS3: ButtonRowPreset.as::_container
    private _container: IWindowContainer;

    // AS3: ButtonRowPreset.as::_list
    private _list: SimpleListViewPreset;

    // AS3: ButtonRowPreset.as::ButtonRowPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, buttons: WiredUIPreset[])
    {
        super(roomEvents, presetManager, wiredStyle);

        this._container = presetManager.createLayout('growing_container_view') as unknown as IWindowContainer;
        this._list = presetManager.createSimpleListView(false, buttons);
        this._list.spacing = wiredStyle.buttonRowSpacing;
        this._container.addChild(this._list.window);
    }

    // AS3: ButtonRowPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: ButtonRowPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._list.resizeToWidth(width);
    }

    // AS3: ButtonRowPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [this._list];
    }

    // AS3: ButtonRowPreset.as::dispose()
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
