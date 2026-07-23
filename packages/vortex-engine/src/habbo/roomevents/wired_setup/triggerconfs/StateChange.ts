import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import {TriggerConfCodes} from './TriggerConfCodes';
import {DefaultTriggerConf} from './DefaultTriggerConf';

/**
 * StateChange — the "the furni's state changes" wired trigger: a to-any / to-specific selector, stored
 * as intParams [mode]; declares hasStateSnapshot.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4351`; the name follows the code it returns
 * (TriggerConfCodes.STATE_CHANGE).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/_SafeCls_4351.as
 */
export class StateChange extends DefaultTriggerConf
{
    // AS3: _SafeCls_4351.as::_options
    private _options!: RadioGroupPreset;

    // AS3: _SafeCls_4351.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.STATE_CHANGE;
    }

    // AS3: _SafeCls_4351.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._options.selected];
    }

    // AS3: _SafeCls_4351.as::get hasStateSnapshot()
    override get hasStateSnapshot(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4351.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4351.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._options = presetManager.createRadioGroup([
            new RadioButtonParam(1, this.l('state_trigger.1')),
            new RadioButtonParam(0, this.l('state_trigger.0'))
        ]);
        const section = presetManager.createSection(this.l('select_options'), this._options);

        builder.addElements(section);
    }

    // AS3: _SafeCls_4351.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._options.selected = def.getInt(0);
    }
}
