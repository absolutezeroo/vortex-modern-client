import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {NumberInputParam} from '../uibuilder/params/NumberInputParam';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {NumberInputPreset} from '../uibuilder/presets/NumberInputPreset';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {UsageInfoSection} from '../uibuilder/presets/sections/UsageInfoSection';
import {AddonCodes} from './AddonCodes';
import {DefaultAddonType} from './DefaultAddonType';

/**
 * ConditionEvaluation — the "condition evaluation mode" wired addon: a usage note and an eval-mode
 * selector (all/any/none/... plus three compare modes each with a threshold number input). Stored as
 * intParams [mode, compareType, compareValue] where mode -1 means "a compare mode is active".
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4109`; the name follows the code it returns
 * (AddonCodes.CONDITION_EVALUATION).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/_SafeCls_4109.as
 */
export class ConditionEvaluation extends DefaultAddonType
{
    // AS3: _SafeCls_4109.as::_compareBase
    private static readonly COMPARE_BASE: number = 4;

    // AS3: _SafeCls_4109.as::_compareTypes
    private static readonly COMPARE_TYPES: number = 3;

    // AS3: _SafeCls_4109.as::_usageInfo
    private _usageInfo!: UsageInfoSection;

    // AS3: _SafeCls_4109.as::_evalMode
    private _evalMode!: RadioGroupPreset;

    // AS3: _SafeCls_4109.as::_compareInputs
    private _compareInputs!: NumberInputPreset[];

    // AS3: _SafeCls_4109.as::get code()
    override get code(): number
    {
        return AddonCodes.CONDITION_EVALUATION;
    }

    // AS3: _SafeCls_4109.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        for(let i = 0; i < ConditionEvaluation.COMPARE_TYPES; i++)
        {
            this._compareInputs[i].value = 0;
        }

        let mode = Math.trunc(def.getInt(0));

        if(mode === -1)
        {
            const compareType = Math.trunc(def.getInt(1));
            const compareValue = Math.trunc(def.getInt(2));
            mode = ConditionEvaluation.COMPARE_BASE + compareType;

            if(compareType >= 0 && compareType < this._compareInputs.length)
            {
                this._compareInputs[compareType].value = compareValue;
            }
        }

        this._evalMode.selected = mode;
    }

    // AS3: _SafeCls_4109.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        let mode = this._evalMode.selected;
        let compareType = 0;
        let compareValue = 0;

        if(mode >= ConditionEvaluation.COMPARE_BASE)
        {
            compareType = mode - ConditionEvaluation.COMPARE_BASE;
            compareValue = this._compareInputs[compareType].value;
            mode = -1;
        }

        return [mode, compareType, compareValue];
    }

    // AS3: _SafeCls_4109.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4109.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._usageInfo = presetManager.createUsageInfoSection(this.l('cond_eval.note'));
        this._compareInputs = [];

        for(let i = 0; i < ConditionEvaluation.COMPARE_TYPES; i++)
        {
            this._compareInputs.push(presetManager.createNumberInput(new NumberInputParam(0, 0, 1000, 35, 0, false, false)));
        }

        this._evalMode = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('eval_mode.0')),
            new RadioButtonParam(1, this.l('eval_mode.1')),
            new RadioButtonParam(2, this.l('eval_mode.2')),
            new RadioButtonParam(3, this.l('eval_mode.3')),
            new RadioButtonParam(4, this.l('eval_mode.cmp.0'), this._compareInputs[0]),
            new RadioButtonParam(5, this.l('eval_mode.cmp.1'), this._compareInputs[1]),
            new RadioButtonParam(6, this.l('eval_mode.cmp.2'), this._compareInputs[2])
        ]);
        const section = presetManager.createSection(this.l('eval_mode'), this._evalMode);

        builder.addElements(this._usageInfo, section);
    }
}
