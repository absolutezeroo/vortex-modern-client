import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {TradeRequirementRule} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/rules/TradeRequirementRule';

import {DefaultElement} from '../../DefaultElement';
import {VariableExtraSourceTypes} from '../../common/VariableExtraSourceTypes';
import {WiredInputSourcePicker} from '../../inputsources/WiredInputSourcePicker';
import type {PresetManager} from '../../uibuilder/PresetManager';
import type {WiredStyle} from '../../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../../uibuilder/WiredUIBuilder';
import {CheckboxOptionParam} from '../../uibuilder/params/CheckboxOptionParam';
import {NumberInputParam} from '../../uibuilder/params/NumberInputParam';
import {RadioButtonParam} from '../../uibuilder/params/RadioButtonParam';
import type {CheckboxGroupPreset} from '../../uibuilder/presets/CheckboxGroupPreset';
import type {RadioGroupPreset} from '../../uibuilder/presets/RadioGroupPreset';
import type {NamedNumberInputPreset} from '../../uibuilder/presets/combinations/NamedNumberInputPreset';
import type {ValueOrVariableSection} from '../../uibuilder/presets/sections/ValueOrVariableSection';
import {ActionTypeCodes} from '../ActionTypeCodes';
import {DefaultActionType} from '../DefaultActionType';

/**
 * InitiateTransaction — the "initiate transaction (contract)" action: a transaction-mode radio (buy /
 * sell / multiply), a value-or-variable multiplier/amount section, and a timeout checkbox+number input.
 * Mode/amount/option/target, the timeout-enabled flag and the timeout seconds go to intParams; the
 * amount variable to variableIds[0]. The furni source is the chest(s) or contract(s).
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4288`). Code = ActionTypeCodes.INITIATE_TRANSACTION.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/chests/_SafeCls_4288.as
 */
export class InitiateTransaction extends DefaultActionType
{
    // AS3: _SafeCls_4288.as::_transactionMode
    private _transactionMode!: RadioGroupPreset;

    // AS3: _SafeCls_4288.as::_SafeStr_5081 (name derived: the amount value-or-variable section)
    private _amountSection!: ValueOrVariableSection;

    // AS3: _SafeCls_4288.as::_SafeStr_7630 (name derived: the timeout checkbox group)
    private _timeoutCheckbox!: CheckboxGroupPreset;

    // AS3: _SafeCls_4288.as::_SafeStr_7928 (name derived: the timeout number input)
    private _timeoutInput!: NamedNumberInputPreset;

    // AS3: _SafeCls_4288.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.INITIATE_TRANSACTION;
    }

    // AS3: _SafeCls_4288.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._transactionMode.selected, this._amountSection.numberValue, this._amountSection.option, this._amountSection.target, this._timeoutCheckbox.optionById(0).selected ? 1 : 0, this._timeoutInput.value];
    }

    // AS3: _SafeCls_4288.as::readVariableIdsFromForm()
    override readVariableIdsFromForm(): string[]
    {
        return [this._amountSection.finalizeSelection];
    }

    // AS3: _SafeCls_4288.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4288.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        let variableId = def.variableIds[0];
        const mode = def.getInt(0);
        this._transactionMode.selected = mode;
        let value = def.getInt(1);
        const option = def.getInt(2);
        const target = def.getInt(3);

        if(option === 0)
        {
            variableId = WiredVariable.DEFAULT_VARIABLE_ID;
        }
        else
        {
            value = 1;
        }

        this._amountSection.init(def.wiredContext.roomVariablesList, variableId, target, option, value);
        this._timeoutCheckbox.optionById(0).selected = def.getBoolean(4);
        this._timeoutInput.value = def.getInt(5);
        this.onModeChange(mode);
    }

    // AS3: _SafeCls_4288.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._transactionMode = presetManager.createRadioGroup([new RadioButtonParam(0, '${wiredfurni.params.contract.mode.0}'), new RadioButtonParam(1, '${wiredfurni.params.contract.mode.1}'), new RadioButtonParam(2, '${wiredfurni.params.contract.mode.2}')], (selected: number): void => this.onModeChange(selected));
        const modeSection = presetManager.createSection('${wiredfurni.params.contract.mode}', this._transactionMode);
        this._amountSection = presetManager.createValueOrVariableSection(0, this.mergedSourceOptions(0), '${wiredfurni.params.contract.multiplier_selection}', 1, 500);
        this._timeoutInput = presetManager.createNamedNumberInput(new NumberInputParam(300, 30, 3600), '${wiredfurni.params.contract.timeout.selection}');
        const timeoutOption = new CheckboxOptionParam('${wiredfurni.params.contract.timeout.desc}');
        timeoutOption.extra2 = this._timeoutInput;
        this._timeoutCheckbox = presetManager.createCheckboxGroup([timeoutOption]);
        const timeoutSection = presetManager.createSection('${wiredfurni.params.contract.timeout}', this._timeoutCheckbox);
        builder.addElements(modeSection, this._amountSection, timeoutSection);
    }

    // AS3: _SafeCls_4288.as::onEditInitialized()
    override onEditInitialized(): void
    {
        this._amountSection.onEditInitialized();
    }

    // AS3: _SafeCls_4288.as::isInputSourceDisabled()
    override isInputSourceDisabled(a: number, b: number): boolean
    {
        if(b === WiredInputSourcePicker.MERGED_SOURCE && a === 0)
        {
            return this._amountSection.isSourcePickingDisabled();
        }

        return false;
    }

    // AS3: _SafeCls_4288.as::onModeChange()
    private onModeChange(mode: number): void
    {
        const isMultiplier = mode === TradeRequirementRule.TYPE_2;
        const isDisabled = mode === TradeRequirementRule.TYPE_0;
        this._amountSection.sectionTitle = isMultiplier ? '${wiredfurni.params.contract.multiplier_selection2}' : '${wiredfurni.params.contract.multiplier_selection}';
        this._amountSection.disabled = isDisabled;
    }

    // AS3: _SafeCls_4288.as::mergedSelectionTitle()
    override mergedSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.merged.title.variables_reference';
    }

    // AS3: _SafeCls_4288.as::furniSelectionTitle()
    override furniSelectionTitle(id: number): string
    {
        if(id === 0)
        {
            return 'wiredfurni.params.sources.furni.title.chests';
        }

        return 'wiredfurni.params.sources.furni.title.contracts';
    }

    // AS3: _SafeCls_4288.as::mergedSelections()
    override mergedSelections(): number[][]
    {
        return [[2, 1]];
    }

    // AS3: _SafeCls_4288.as::setMergedType()
    override setMergedType(_a: number, b: number): void
    {
        this._amountSection.target = b;
    }

    // AS3: _SafeCls_4288.as::getMergedType()
    override getMergedType(_id: number): number
    {
        return this._amountSection.target;
    }

    // AS3: _SafeCls_4288.as::get forceHidePickFurniInstructions()
    override get forceHidePickFurniInstructions(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4288.as::getCustomSourcesForMergedType()
    override getCustomSourcesForMergedType(_id: number): number[]
    {
        return [VariableExtraSourceTypes.GLOBAL_SOURCE, VariableExtraSourceTypes.CONTEXT_SOURCE];
    }

    // AS3: _SafeCls_4288.as::hasCustomTypePicker()
    override hasCustomTypePicker(_id: number): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4288.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }
}
