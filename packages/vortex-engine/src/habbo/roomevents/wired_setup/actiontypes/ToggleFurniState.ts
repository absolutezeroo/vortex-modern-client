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
 * ToggleFurniState — the "toggle furni state" wired action: a radio choice between the two toggle
 * modes, stored as intParams[0].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4085`; the name follows the code it returns
 * (ActionTypeCodes.TOGGLE_FURNI_STATE).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4085.as
 */
export class ToggleFurniState extends DefaultActionType
{
    // AS3: _SafeCls_4085.as::toggleMode
    private _toggleMode!: RadioGroupPreset;

    // AS3: _SafeCls_4085.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.TOGGLE_FURNI_STATE;
    }

    // AS3: _SafeCls_4085.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4085.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const params = [
            new RadioButtonParam(0, this.loc('wiredfurni.params.toggletype.0')),
            new RadioButtonParam(1, this.loc('wiredfurni.params.toggletype.1'))
        ];
        const group = presetManager.createRadioGroup(params);
        const section = presetManager.createSection(this.loc('wiredfurni.params.toggletype_selection'), group);

        builder.addElements(section);
        this._toggleMode = group;
    }

    // AS3: _SafeCls_4085.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._toggleMode.selected = def.getInt(0);
    }

    // AS3: _SafeCls_4085.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._toggleMode.selected];
    }
}
