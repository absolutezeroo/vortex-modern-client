import type {IWindow} from '@core/window/IWindow';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import {WiredUIPreset} from './WiredUIPreset';

/**
 * SpacerPreset — a fixed-height empty container used to insert vertical space (and, optionally, a
 * solid background colour) between presets. Doubles as the "blend spacer" a sibling preset paints
 * its background through.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/SpacerPreset.as
 */
export class SpacerPreset extends WiredUIPreset
{
    // AS3: SpacerPreset.as::_container
    private _container: IWindow;

    // AS3: SpacerPreset.as::SpacerPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, height: number)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._container = presetManager.createLayout('container_view');
        this._container.height = height;
    }

    // AS3: SpacerPreset.as::set backgroundEnabled()
    set backgroundEnabled(enabled: boolean)
    {
        this._container.background = enabled;
    }

    // AS3: SpacerPreset.as::set backgroundColor()
    set backgroundColor(color: number)
    {
        this._container.color = (0xFF000000 | color) >>> 0;
    }

    // AS3: SpacerPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: SpacerPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._container.width = width;
    }

    // AS3: SpacerPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as IWindow;
    }
}
