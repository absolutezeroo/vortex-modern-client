import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import {WiredUIPreset} from './WiredUIPreset';

/**
 * VerticalSplitterPreset — a 1px-wide vertical divider of a fixed height, painted in the style's
 * vertical splitter colour.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/VerticalSplitterPreset.as
 */
export class VerticalSplitterPreset extends WiredUIPreset
{
    // AS3: VerticalSplitterPreset.as::SPLITTER_WIDTH
    private static readonly SPLITTER_WIDTH: number = 1;

    // AS3: VerticalSplitterPreset.as::_window
    private _window: IWindowContainer;

    // AS3: VerticalSplitterPreset.as::_height
    private _height: number;

    // AS3: VerticalSplitterPreset.as::VerticalSplitterPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, height: number)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._height = height;
        this._window = presetManager.createLayout('container_view') as unknown as IWindowContainer;
        this._window.width = 1;
        this._window.height = this._height;
        this._window.background = true;
        this._window.color = wiredStyle.verticalSplitterColor;
    }

    // AS3: VerticalSplitterPreset.as::get window()
    override get window(): IWindow
    {
        return this._window;
    }

    // AS3: VerticalSplitterPreset.as::hasStaticWidth()
    override hasStaticWidth(): boolean
    {
        return true;
    }

    // AS3: VerticalSplitterPreset.as::get staticWidth()
    override get staticWidth(): number
    {
        return 1;
    }

    // AS3: VerticalSplitterPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._window.width = 1;
        this._window.height = this._height;
    }

    // AS3: VerticalSplitterPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._window.dispose();
        this._window = null as unknown as IWindowContainer;
    }
}
