import type {IWindow} from '@core/window/IWindow';

import type {HabboUserDefinedRoomEvents} from '../../../../HabboUserDefinedRoomEvents';
import type {PresetManager} from '../../PresetManager';
import {CheckboxOptionParam} from '../../params/CheckboxOptionParam';
import type {WiredStyle} from '../../styles/WiredStyle';
import type {CheckboxGroupPreset} from '../CheckboxGroupPreset';
import {WiredUIPreset} from '../WiredUIPreset';

/**
 * ChronoMaskFilterPreset — a bitmask checkbox grid used by DateMatches for weekday/month selection: one
 * checkbox per label (bit index = position), laid out in a fixed number of columns. `mask` reads/writes
 * the combined bitmask.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/applications/ChronoMaskFilterPreset.as
 */
export class ChronoMaskFilterPreset extends WiredUIPreset
{
    // AS3: ChronoMaskFilterPreset.as::_checkboxGroup
    private _checkboxGroup: CheckboxGroupPreset;

    // AS3: ChronoMaskFilterPreset.as::ChronoMaskFilterPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, labels: string[], columns: number = 1)
    {
        super(roomEvents, presetManager, wiredStyle);

        const params: CheckboxOptionParam[] = [];

        for(let i = 0; i < labels.length; i++)
        {
            params.push(new CheckboxOptionParam(labels[i], i));
        }

        this._checkboxGroup = presetManager.createCheckboxGroup(params, null, columns);
    }

    // AS3: ChronoMaskFilterPreset.as::get mask()
    get mask(): number
    {
        return this._checkboxGroup.mask;
    }

    // AS3: ChronoMaskFilterPreset.as::set mask()
    set mask(value: number)
    {
        this._checkboxGroup.mask = value;
    }

    // AS3: ChronoMaskFilterPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._checkboxGroup.resizeToWidth(width);
    }

    // AS3: ChronoMaskFilterPreset.as::get window()
    override get window(): IWindow
    {
        return this._checkboxGroup.window;
    }

    // AS3: ChronoMaskFilterPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [this._checkboxGroup];
    }

    // AS3: ChronoMaskFilterPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._checkboxGroup = null as unknown as CheckboxGroupPreset;
    }
}
