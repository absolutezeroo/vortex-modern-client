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
 * ActionCode3 — a state-snapshot wired action exposing four "condition" checkboxes (state, direction,
 * position, altitude) stored as four boolean intParams; it declares hasStateSnapshot.
 *
 * Name derived: both the AS3 class (`_SafeCls_4362`) and the code it returns are obfuscated with no
 * readable counterpart in any source tree — the code constant is likewise carried as
 * ActionTypeCodes.ACTION_CODE_3 (value 3). The class name mirrors that derivation rather than
 * inventing a semantic label; the four checkboxes/hasStateSnapshot above describe the observed
 * behavior.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4362.as
 */
export class ActionCode3 extends DefaultActionType
{
    // AS3: _SafeCls_4362.as::_SafeStr_7853 (name derived)
    private _conditions!: CheckboxGroupPreset;

    // AS3: _SafeCls_4362.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.ACTION_CODE_3;
    }

    // AS3: _SafeCls_4362.as::get hasStateSnapshot()
    override get hasStateSnapshot(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4362.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4362.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const params = [
            new CheckboxOptionParam(this.loc('wiredfurni.params.condition.state')),
            new CheckboxOptionParam(this.loc('wiredfurni.params.condition.direction')),
            new CheckboxOptionParam(this.loc('wiredfurni.params.condition.position')),
            new CheckboxOptionParam(this.loc('wiredfurni.params.condition.altitude'))
        ];
        this._conditions = presetManager.createCheckboxGroup(params);

        const section = presetManager.createSection(this.loc('wiredfurni.params.conditions'), this._conditions);

        builder.addElements(section);
    }

    // AS3: _SafeCls_4362.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        for(let i = 0; i < 4; i++)
        {
            this._conditions.optionById(i).selected = def.getBoolean(i);
        }
    }

    // AS3: _SafeCls_4362.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];

        for(let i = 0; i < 4; i++)
        {
            params.push(this._conditions.optionById(i).selected ? 1 : 0);
        }

        return params;
    }
}
