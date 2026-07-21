import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import {WiredUIPreset} from './WiredUIPreset';

/**
 * StaticHeightPreset — wraps a preset in a container pinned to a fixed height, while still resizing
 * the wrapped preset to the container's width.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/StaticHeightPreset.as
 */
export class StaticHeightPreset extends WiredUIPreset
{
    // AS3: StaticHeightPreset.as::_window
    private _window: IWindowContainer;

    // AS3: StaticHeightPreset.as::_SafeStr_5158 (wrapped preset)
    private _wrapped: WiredUIPreset;

    // AS3: StaticHeightPreset.as::StaticHeightPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, wrapped: WiredUIPreset, height: number)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._window = presetManager.createLayout('container_view') as unknown as IWindowContainer;
        this._wrapped = wrapped;
        this._window.addChild(this._wrapped.window);
        this._window.height = height;
    }

    // AS3: StaticHeightPreset.as::get window()
    override get window(): IWindow
    {
        return this._window;
    }

    // AS3: StaticHeightPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._window.width = width;
        this._wrapped.resizeToWidth(width);
    }

    // AS3: StaticHeightPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [this._wrapped];
    }

    // AS3: StaticHeightPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._window.dispose();
        this._window = null as unknown as IWindowContainer;
        this._wrapped = null as unknown as WiredUIPreset;
    }
}
