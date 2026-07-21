import type {IWindow} from '@core/window/IWindow';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import {WiredUIPreset} from './WiredUIPreset';

/**
 * WindowWrapperPreset — wraps an already-built window as a preset, optionally treating its current
 * width as a fixed (static) width so aligning wrappers can position it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/WindowWrapperPreset.as
 */
export class WindowWrapperPreset extends WiredUIPreset
{
    // AS3: WindowWrapperPreset.as::_window
    private _window: IWindow;

    // AS3: WindowWrapperPreset.as::_staticWidth
    private _staticWidth: boolean;

    // AS3: WindowWrapperPreset.as::WindowWrapperPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, window: IWindow, staticWidth: boolean)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._window = window;
        this._staticWidth = staticWidth;
    }

    // AS3: WindowWrapperPreset.as::get window()
    override get window(): IWindow
    {
        return this._window;
    }

    // AS3: WindowWrapperPreset.as::hasStaticWidth()
    override hasStaticWidth(): boolean
    {
        return this._staticWidth;
    }

    // AS3: WindowWrapperPreset.as::get staticWidth()
    override get staticWidth(): number
    {
        if(!this._staticWidth)
        {
            return -1;
        }

        return this._window.width;
    }

    // AS3: WindowWrapperPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._window.width = width;
    }

    // AS3: WindowWrapperPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._window.dispose();
        this._window = null as unknown as IWindow;
    }
}
