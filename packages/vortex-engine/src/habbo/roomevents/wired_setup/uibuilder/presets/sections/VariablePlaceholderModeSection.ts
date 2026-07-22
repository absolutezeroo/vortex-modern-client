import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import {RadioButtonParam} from '../../params/RadioButtonParam';
import type {RadioButtonPreset} from '../RadioButtonPreset';
import type {RadioGroupPreset} from '../RadioGroupPreset';
import {AbstractSectionPreset} from './AbstractSectionPreset';

/**
 * VariablePlaceholderModeSection — a titled two-option radio group choosing whether a variable
 * placeholder renders as its value or as text.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/sections/VariablePlaceholderModeSection.as
 */
export class VariablePlaceholderModeSection extends AbstractSectionPreset
{
    // AS3: VariablePlaceholderModeSection.as::_SafeStr_5343 (name derived: the display-mode radio group)
    private _mode: RadioGroupPreset;

    // AS3: VariablePlaceholderModeSection.as::VariablePlaceholderModeSection()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, title: string)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._mode = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('texts.variable_display_type.1')),
            new RadioButtonParam(1, this.l('texts.variable_display_type.2'), null, presetManager.createText(this.l('texts.variable_display_type.2.info')).halfBlend().noDisable())
        ]);
        this.initializeSection(title, this._mode);
    }

    // AS3: VariablePlaceholderModeSection.as::get isTextMode()
    get isTextMode(): boolean
    {
        return this._mode.selected === 1;
    }

    // AS3: VariablePlaceholderModeSection.as::set isTextMode()
    set isTextMode(value: boolean)
    {
        this._mode.selected = value ? 1 : 0;
    }

    // AS3: VariablePlaceholderModeSection.as::_SafeStr_4547() (name derived: fetch the radio option by index)
    radioAt(index: number): RadioButtonPreset
    {
        return this._mode.radioAt(index);
    }

    // AS3: VariablePlaceholderModeSection.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._mode = null as unknown as RadioGroupPreset;
    }
}
