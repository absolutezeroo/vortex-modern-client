import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {CheckboxOptionParam} from '../uibuilder/params/CheckboxOptionParam';
import type {CheckboxGroupPreset} from '../uibuilder/presets/CheckboxGroupPreset';
import {ConditionCodes} from './ConditionCodes';
import {DefaultConditionType} from './DefaultConditionType';

/**
 * StatesMatch — the "the furni states match a snapshot" wired condition: four aspect checkboxes
 * (state/direction/position/altitude) stored as four boolean intParams; declares hasStateSnapshot.
 * Exposes the negation (NOT_STATES_MATCH).
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4406`; the name follows the code it returns
 * (ConditionCodes.STATES_MATCH).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/_SafeCls_4406.as
 */
export class StatesMatch extends DefaultConditionType
{
    // AS3: _SafeCls_4406.as::_conditions
    private _conditions!: CheckboxGroupPreset;

    // AS3: _SafeCls_4406.as::get code()
    override get code(): number
    {
        return ConditionCodes.STATES_MATCH;
    }

    // AS3: _SafeCls_4406.as::get negativeCode()
    override get negativeCode(): number
    {
        return ConditionCodes.NOT_STATES_MATCH;
    }

    // AS3: _SafeCls_4406.as::get hasStateSnapshot()
    override get hasStateSnapshot(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4406.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4406.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._conditions = presetManager.createCheckboxGroup([
            new CheckboxOptionParam(this.l('condition.state')),
            new CheckboxOptionParam(this.l('condition.direction')),
            new CheckboxOptionParam(this.l('condition.position')),
            new CheckboxOptionParam(this.l('condition.altitude'))
        ]);
        const section = presetManager.createSection(this.l('conditions'), this._conditions);

        builder.addElements(section);
    }

    // AS3: _SafeCls_4406.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        for(let i = 0; i < 4; i++)
        {
            this._conditions.optionById(i).selected = def.getBoolean(i);
        }
    }

    // AS3: _SafeCls_4406.as::readIntParamsFromForm()
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
