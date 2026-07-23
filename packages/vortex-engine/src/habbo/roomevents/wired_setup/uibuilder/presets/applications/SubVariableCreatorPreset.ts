import type {IWindow} from '@core/window/IWindow';

import type {HabboUserDefinedRoomEvents} from '../../../../HabboUserDefinedRoomEvents';
import type {PresetManager} from '../../PresetManager';
import {CheckboxOptionParam} from '../../params/CheckboxOptionParam';
import {TextInputParam} from '../../params/TextInputParam';
import {TextParam} from '../../params/TextParam';
import type {SubVariableParam} from '../../params/applications/SubVariableParam';
import type {WiredStyle} from '../../styles/WiredStyle';
import type {CheckboxGroupPreset} from '../CheckboxGroupPreset';
import {WiredUIPreset} from '../WiredUIPreset';

/**
 * SubVariableCreatorPreset — a checkbox grid for opting into a set of auto-created sub-variables. Each
 * row is a checkbox (label "${prefix}{id}"), a right-aligned default-name text input and, optionally, an
 * extra explanatory line. `mask` reads/writes a bitmask keyed by each row's SubVariableParam id (which,
 * unlike the checkbox indices, may be non-contiguous — hence the id lookup table).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/applications/SubVariableCreatorPreset.as
 */
export class SubVariableCreatorPreset extends WiredUIPreset
{
    // AS3: SubVariableCreatorPreset.as::_checkboxGroup
    private _checkboxGroup: CheckboxGroupPreset;

    // AS3: SubVariableCreatorPreset.as::_SafeStr_6702 (name derived: the per-row bit ids)
    private _ids: number[];

    // AS3: SubVariableCreatorPreset.as::SubVariableCreatorPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, prefix: string, params: SubVariableParam[])
    {
        super(roomEvents, presetManager, wiredStyle);

        this._ids = [];
        const options: CheckboxOptionParam[] = [];

        for(const param of params)
        {
            const key = prefix + param.id;
            const option = new CheckboxOptionParam('${' + key + '}');
            option.extra1 = presetManager.createTextInput(new TextInputParam(param.name, -1, null, 85, null, false)).alignRight();

            if(param.hasExtraText)
            {
                const textParam = new TextParam(1);
                textParam.textColor = wiredStyle.softTextColor;
                option.extra2 = presetManager.createText('${' + key + '.extra}', textParam);
            }

            options.push(option);
            this._ids.push(param.id);
        }

        this._checkboxGroup = presetManager.createCheckboxGroup(options);
    }

    // AS3: SubVariableCreatorPreset.as::set mask()
    set mask(value: number)
    {
        for(let i = 0; i < this._checkboxGroup.numCheckboxes; i++)
        {
            const option = this._checkboxGroup.optionById(i);
            const bit = this._ids[i];
            option.selected = (value & (1 << bit)) > 0;
        }
    }

    // AS3: SubVariableCreatorPreset.as::get mask()
    get mask(): number
    {
        let mask = 0;

        for(let i = 0; i < this._checkboxGroup.numCheckboxes; i++)
        {
            const option = this._checkboxGroup.optionById(i);

            if(option.selected)
            {
                const bit = this._ids[i];
                mask |= 1 << bit;
            }
        }

        return mask;
    }

    // AS3: SubVariableCreatorPreset.as::get window()
    override get window(): IWindow
    {
        return this._checkboxGroup.window;
    }

    // AS3: SubVariableCreatorPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._checkboxGroup.resizeToWidth(width);
    }

    // AS3: SubVariableCreatorPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [this._checkboxGroup];
    }

    // AS3: SubVariableCreatorPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._checkboxGroup = null as unknown as CheckboxGroupPreset;
        this._ids = null as unknown as number[];
    }
}
