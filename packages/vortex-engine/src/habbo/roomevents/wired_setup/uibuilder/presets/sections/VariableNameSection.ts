import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import {TextInputParam} from '../../params/TextInputParam';
import type {TextInputPreset} from '../TextInputPreset';
import {AbstractSectionPreset} from './AbstractSectionPreset';

/**
 * VariableNameSection — a titled text input for a variable name, normalising the entered text to a
 * lower-case underscore-joined identifier as it changes.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/sections/VariableNameSection.as
 */
export class VariableNameSection extends AbstractSectionPreset
{
    // AS3: VariableNameSection.as::_name
    private _name: TextInputPreset;

    // AS3: VariableNameSection.as::VariableNameSection()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._name = presetManager.createTextInput(new TextInputParam('', 40));
        this._name.addListener(this.onPlaceholderChange);
        this.initializeSection(this.l('variables.variable_name'), this._name);
    }

    // AS3: VariableNameSection.as::onPlaceholderChange()
    private onPlaceholderChange = (value: string): void =>
    {
        const current = this._name.text;
        const normalized = value.split(' ').join('_').toLowerCase();

        if(current !== normalized)
        {
            this._name.text = normalized;
        }
    };

    // AS3: VariableNameSection.as::set variableName()
    set variableName(value: string)
    {
        this._name.text = value;
        this.onPlaceholderChange(value);
    }

    // AS3: VariableNameSection.as::get variableName()
    get variableName(): string
    {
        return this._name.text.split(' ').join('_').toLowerCase();
    }

    // AS3: VariableNameSection.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._name = null as unknown as TextInputPreset;
    }
}
