import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';

import {DefaultElement} from '../../DefaultElement';
import {VariableExtraSourceTypes} from '../../common/VariableExtraSourceTypes';
import {WiredInputSourcePicker} from '../../inputsources/WiredInputSourcePicker';
import type {PresetManager} from '../../uibuilder/PresetManager';
import type {WiredStyle} from '../../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../../uibuilder/params/RadioButtonParam';
import type {RadioGroupPreset} from '../../uibuilder/presets/RadioGroupPreset';
import type {SectionPreset} from '../../uibuilder/presets/SectionPreset';
import type {ValueOrVariableSection} from '../../uibuilder/presets/sections/ValueOrVariableSection';
import {ConditionCodes} from '../ConditionCodes';
import {DefaultConditionType} from '../DefaultConditionType';

/**
 * ChestHasAmount — the "chest has (this many) items" condition: a comparison-operator radio
 * (> ≥ = ≤ < ≠) and a value-or-variable amount section. Value/option/target and the operator go to
 * intParams; the amount variable to variableIds[0]. The furni source is the chest(s).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/chests/ChestHasAmount.as
 */
export class ChestHasAmount extends DefaultConditionType
{
    // AS3: ChestHasAmount.as::_SafeStr_8984 (name derived: the comparison section)
    protected _comparisonSection!: SectionPreset;

    // AS3: ChestHasAmount.as::_SafeStr_5081 (name derived: the amount value-or-variable section)
    protected _amountSection!: ValueOrVariableSection;

    // AS3: ChestHasAmount.as::_compareRadioGroup
    private _compareRadioGroup!: RadioGroupPreset;

    // AS3: ChestHasAmount.as::get code()
    override get code(): number
    {
        return ConditionCodes.CHEST_HAS_ITEMS;
    }

    // AS3: ChestHasAmount.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];

        params.push(this._amountSection.numberValue);
        params.push(this._amountSection.option);
        params.push(this._amountSection.target);
        params.push(this._compareRadioGroup.selected);

        return params;
    }

    // AS3: ChestHasAmount.as::readVariableIdsFromForm()
    override readVariableIdsFromForm(): string[]
    {
        return [this._amountSection.finalizeSelection];
    }

    // AS3: ChestHasAmount.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        let variableId = def.variableIds[0];
        let value = def.getInt(0);
        const option = def.getInt(1);
        const target = def.getInt(2);

        if(option === 0)
        {
            variableId = WiredVariable.DEFAULT_VARIABLE_ID;
        }
        else
        {
            value = 1;
        }

        this._amountSection.init(def.wiredContext.roomVariablesList, variableId, target, option, value);
        this._compareRadioGroup.selected = def.getInt(3);
    }

    // AS3: ChestHasAmount.as::onEditInitialized()
    override onEditInitialized(): void
    {
        this._amountSection.onEditInitialized();
    }

    // AS3: ChestHasAmount.as::isInputSourceDisabled()
    override isInputSourceDisabled(a: number, b: number): boolean
    {
        if(b === WiredInputSourcePicker.MERGED_SOURCE && a === 0)
        {
            return this._amountSection.isSourcePickingDisabled();
        }

        return false;
    }

    // AS3: ChestHasAmount.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: ChestHasAmount.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._compareRadioGroup = presetManager.createRadioGroup([new RadioButtonParam(2, '>'), new RadioButtonParam(5, '≥'), new RadioButtonParam(1, '='), new RadioButtonParam(3, '≤'), new RadioButtonParam(0, '<'), new RadioButtonParam(4, '≠')], null, 6);
        this._comparisonSection = presetManager.createSection(this.l('comparison_selection'), this._compareRadioGroup);
        this._amountSection = presetManager.createValueOrVariableSection(0, this.mergedSourceOptions(0), this.l('chest_compare_amount'), 0, 1000000);
        builder.addElements(this._comparisonSection, this._amountSection);
    }

    // AS3: ChestHasAmount.as::mergedSelectionTitle()
    override mergedSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.merged.title.variables_reference';
    }

    // AS3: ChestHasAmount.as::furniSelectionTitle()
    override furniSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.furni.title.chests';
    }

    // AS3: ChestHasAmount.as::mergedSelections()
    override mergedSelections(): number[][]
    {
        return [[1, 0]];
    }

    // AS3: ChestHasAmount.as::setMergedType()
    override setMergedType(_a: number, b: number): void
    {
        this._amountSection.target = b;
    }

    // AS3: ChestHasAmount.as::getMergedType()
    override getMergedType(_id: number): number
    {
        return this._amountSection.target;
    }

    // AS3: ChestHasAmount.as::get forceHidePickFurniInstructions()
    override get forceHidePickFurniInstructions(): boolean
    {
        return true;
    }

    // AS3: ChestHasAmount.as::getCustomSourcesForMergedType()
    override getCustomSourcesForMergedType(_id: number): number[]
    {
        return [VariableExtraSourceTypes.GLOBAL_SOURCE, VariableExtraSourceTypes.CONTEXT_SOURCE];
    }

    // AS3: ChestHasAmount.as::hasCustomTypePicker()
    override hasCustomTypePicker(_id: number): boolean
    {
        return true;
    }

    // AS3: ChestHasAmount.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }
}
