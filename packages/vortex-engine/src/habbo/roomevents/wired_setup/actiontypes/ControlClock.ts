import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * ControlClock — the "control clock furni" wired action: a single 5-way control selector
 * (start/stop/pause/… clock_control.0..4), stored as intParams [control].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4061`; the name follows the code it returns
 * (ActionTypeCodes.CONTROL_CLOCK).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4061.as
 */
export class ControlClock extends DefaultActionType
{
    // AS3: _SafeCls_4061.as::_control
    private _control!: RadioGroupPreset;

    // AS3: _SafeCls_4061.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.CONTROL_CLOCK;
    }

    // AS3: _SafeCls_4061.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4061.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._control = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('clock_control.0')),
            new RadioButtonParam(1, this.l('clock_control.1')),
            new RadioButtonParam(2, this.l('clock_control.2')),
            new RadioButtonParam(3, this.l('clock_control.3')),
            new RadioButtonParam(4, this.l('clock_control.4'))
        ]);
        this._control.selected = 0;
        const section = presetManager.createSection(this.l('clock_control'), this._control);

        builder.addElements(section);
    }

    // AS3: _SafeCls_4061.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._control.selected = def.getInt(0);
    }

    // AS3: _SafeCls_4061.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._control.selected];
    }
}
