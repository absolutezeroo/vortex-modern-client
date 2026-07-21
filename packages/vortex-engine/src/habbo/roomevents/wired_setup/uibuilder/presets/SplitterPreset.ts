import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import {WiredUIPreset} from './WiredUIPreset';

/**
 * SplitterPreset — a full-width horizontal ruler/divider, cloned from the style's splitter view and
 * stretched to the available width on resize.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/SplitterPreset.as
 */
export class SplitterPreset extends WiredUIPreset
{
    // AS3: SplitterPreset.as::_window
    private _window: IWindowContainer;

    // AS3: SplitterPreset.as::SplitterPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._window = wiredStyle.createSplitterView();
    }

    // AS3: SplitterPreset.as::get window()
    override get window(): IWindow
    {
        return this._window;
    }

    // AS3: SplitterPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._window.width = width;
    }

    // AS3: SplitterPreset.as::dispose()
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
