import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {CheckboxOptionParam} from '../uibuilder/params/CheckboxOptionParam';
import type {CheckboxGroupPreset} from '../uibuilder/presets/CheckboxGroupPreset';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * ActionCode8 — a teleport wired action exposing a single "teleport options" checkbox, stored as one
 * boolean intParam.
 *
 * Name derived: both the AS3 class (`_SafeCls_4439`) and the code it returns are obfuscated with no
 * readable counterpart in any source tree — the code constant is likewise carried as
 * ActionTypeCodes.ACTION_CODE_8 (value 8). The class name mirrors that derivation rather than
 * inventing a semantic label; the single teleport-options checkbox above describes the observed
 * behavior.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4439.as
 */
export class ActionCode8 extends DefaultActionType
{
    // AS3: _SafeCls_4439.as::_SafeStr_8429 (name derived)
    private _teleportOptions!: CheckboxGroupPreset;

    // AS3: _SafeCls_4439.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.ACTION_CODE_8;
    }

    // AS3: _SafeCls_4439.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4439.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const params = [new CheckboxOptionParam(this.loc('wiredfurni.params.teleport.options.0'))];
        const group = presetManager.createCheckboxGroup(params);

        const section = presetManager.createSection(this.loc('wiredfurni.params.teleport.options'), group);

        builder.addElements(section);

        this._teleportOptions = group;
    }

    // AS3: _SafeCls_4439.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._teleportOptions.optionById(0).selected = def.getBoolean(0);
    }

    // AS3: _SafeCls_4439.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._teleportOptions.optionById(0).selected ? 1 : 0];
    }
}
