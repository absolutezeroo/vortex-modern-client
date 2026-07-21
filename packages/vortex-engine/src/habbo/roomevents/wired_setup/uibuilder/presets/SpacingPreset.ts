import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import {WiredUIPreset} from './WiredUIPreset';

/**
 * SpacingPreset — a fixed-size empty container inserting either vertical (`vertical=true`, sets
 * height) or horizontal (sets width) space. Unlike SpacerPreset it has a static width and ignores
 * resize.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/SpacingPreset.as
 */
export class SpacingPreset extends WiredUIPreset
{
    // AS3: SpacingPreset.as::_container
    private _container: IWindowContainer;

    // AS3: SpacingPreset.as::SpacingPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, vertical: boolean, size: number)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._container = presetManager.createLayout('container_view') as unknown as IWindowContainer;

        if(vertical)
        {
            this._container.height = size;
        }
        else
        {
            this._container.width = size;
        }
    }

    // AS3: SpacingPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: SpacingPreset.as::resizeToWidth()
    override resizeToWidth(_width: number): void
    {
        // AS3: intentionally empty — spacing keeps its fixed size and does not stretch.
    }

    // AS3: SpacingPreset.as::hasStaticWidth()
    override hasStaticWidth(): boolean
    {
        return true;
    }

    // AS3: SpacingPreset.as::get staticWidth()
    override get staticWidth(): number
    {
        return this._container.width;
    }

    // AS3: SpacingPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as IWindowContainer;
    }
}
