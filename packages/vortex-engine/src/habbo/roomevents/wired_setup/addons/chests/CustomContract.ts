import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {TradeRequirementNode} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/TradeRequirementNode';

import {DefaultElement} from '../../DefaultElement';
import {VariableExtraSourceTypes} from '../../common/VariableExtraSourceTypes';
import {WiredInputSourcePicker} from '../../inputsources/WiredInputSourcePicker';
import type {PresetManager} from '../../uibuilder/PresetManager';
import type {WiredStyle} from '../../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../../uibuilder/WiredUIBuilder';
import {CheckboxOptionParam} from '../../uibuilder/params/CheckboxOptionParam';
import {RadioButtonParam} from '../../uibuilder/params/RadioButtonParam';
import {SectionParam} from '../../uibuilder/params/SectionParam';
import type {CheckboxGroupPreset} from '../../uibuilder/presets/CheckboxGroupPreset';
import type {RadioGroupPreset} from '../../uibuilder/presets/RadioGroupPreset';
import {WindowWrapperPreset} from '../../uibuilder/presets/WindowWrapperPreset';
import type {ValueOrVariableSection} from '../../uibuilder/presets/sections/ValueOrVariableSection';
import {AddonCodes} from '../AddonCodes';
import {DefaultAddonType} from '../DefaultAddonType';

/**
 * CustomContract — the "custom trade contract" addon: two symmetric sub-forms (payment and reward), each
 * an enable checkbox, an element-type radio (coin / furni) and a value-or-variable amount section; plus
 * a usage warning and a splitter view. Both sub-forms serialize enabled/type/option/value/target into
 * intParams and their amount variables into variableIds[0..1].
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4381`). Code = AddonCodes.CUSTOM_CONTRACT.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/chests/_SafeCls_4381.as
 */
export class CustomContract extends DefaultAddonType
{
    // AS3: _SafeCls_4381.as::_SafeStr_6924 (name derived: the enable-payment checkbox group)
    private _paymentCheckbox!: CheckboxGroupPreset;

    // AS3: _SafeCls_4381.as::_SafeStr_7328 (name derived: the payment element-type radio group)
    private _paymentType!: RadioGroupPreset;

    // AS3: _SafeCls_4381.as::_SafeStr_5460 (name derived: the payment amount section)
    private _paymentAmount!: ValueOrVariableSection;

    // AS3: _SafeCls_4381.as::_SafeStr_6528 (name derived: the enable-reward checkbox group)
    private _rewardCheckbox!: CheckboxGroupPreset;

    // AS3: _SafeCls_4381.as::_SafeStr_6986 (name derived: the reward element-type radio group)
    private _rewardType!: RadioGroupPreset;

    // AS3: _SafeCls_4381.as::_SafeStr_5398 (name derived: the reward amount section)
    private _rewardAmount!: ValueOrVariableSection;

    // AS3: _SafeCls_4381.as::get code()
    override get code(): number
    {
        return AddonCodes.CUSTOM_CONTRACT;
    }

    // AS3: _SafeCls_4381.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        // AS3 pushes the checkbox Booleans directly; serialized as 0/1 on the wire.
        return [this._paymentCheckbox.optionById(0).selected ? 1 : 0, this._paymentType.selected, this._paymentAmount.option, this._paymentAmount.numberValue, this._paymentAmount.target, this._rewardCheckbox.optionById(0).selected ? 1 : 0, this._rewardType.selected, this._rewardAmount.option, this._rewardAmount.numberValue, this._rewardAmount.target];
    }

    // AS3: _SafeCls_4381.as::readVariableIdsFromForm()
    override readVariableIdsFromForm(): string[]
    {
        return [this._paymentAmount.finalizeSelection, this._rewardAmount.finalizeSelection];
    }

    // AS3: _SafeCls_4381.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4381.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        let paymentVarId = def.variableIds[0];
        const paymentEnabled = def.getBoolean(0);
        const paymentTypeValue = def.getInt(1);
        const paymentOption = def.getInt(2);
        let paymentValue = def.getInt(3);
        const paymentTarget = def.getInt(4);

        if(paymentEnabled)
        {
            if(paymentOption === 0)
            {
                paymentVarId = WiredVariable.DEFAULT_VARIABLE_ID;
            }
            else
            {
                paymentValue = 1;
            }
        }
        else
        {
            paymentVarId = WiredVariable.DEFAULT_VARIABLE_ID;
            paymentValue = 1;
        }

        this._paymentCheckbox.optionById(0).selected = paymentEnabled;
        this._paymentType.selected = paymentTypeValue;
        this._paymentAmount.init(def.wiredContext.roomVariablesList, paymentVarId, paymentTarget, paymentOption, paymentValue);

        let rewardVarId = def.variableIds[1];
        const rewardEnabled = def.getBoolean(5);
        const rewardTypeValue = def.getInt(6);
        const rewardOption = def.getInt(7);
        let rewardValue = def.getInt(8);
        const rewardTarget = def.getInt(9);

        if(rewardEnabled)
        {
            if(rewardOption === 0)
            {
                rewardVarId = WiredVariable.DEFAULT_VARIABLE_ID;
            }
            else
            {
                rewardValue = 1;
            }
        }
        else
        {
            rewardVarId = WiredVariable.DEFAULT_VARIABLE_ID;
            rewardValue = 1;
        }

        this._rewardCheckbox.optionById(0).selected = rewardEnabled;
        this._rewardType.selected = rewardTypeValue;
        this._rewardAmount.init(def.wiredContext.roomVariablesList, rewardVarId, rewardTarget, rewardOption, rewardValue);

        this.onPaymentSelectedChanged(0, paymentEnabled);
        this.onRewardSelectedChanged(0, rewardEnabled);
    }

    // AS3: _SafeCls_4381.as::buildInputs()
    override buildInputs(presetManager: PresetManager, wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const usageWarning = presetManager.createUsageWarningSection('${wiredfurni.params.custom_contract.usage_warning}');

        this._paymentType = presetManager.createRadioGroup([new RadioButtonParam(0, '${wiredfurni.params.custom_contract.element_type_selection.0}'), new RadioButtonParam(1, '${wiredfurni.params.custom_contract.element_type_selection.1}')], (selected: number): void => this.onPaymentTypeChanged(selected), 2);
        const paymentTypeSection = presetManager.createSection('${wiredfurni.params.custom_contract.element_type_selection}', this._paymentType);
        this._paymentAmount = presetManager.createValueOrVariableSection(0, this.mergedSourceOptions(0), '${wiredfurni.params.custom_contract.amount_selection}', 1, 100000);
        const paymentList = presetManager.createSimpleListView(true, [paymentTypeSection, presetManager.createSpacer(wiredStyle.sectionSpacing), this._paymentAmount]);
        paymentList.spacing = 0;
        const paymentOption = new CheckboxOptionParam('${wiredfurni.params.custom_contract.enable_payment}');
        paymentOption.extra2 = paymentList;
        this._paymentCheckbox = presetManager.createCheckboxGroup([paymentOption], (id: number, selected: boolean): void => this.onPaymentSelectedChanged(id, selected));
        const paymentSection = presetManager.createSection('${wiredfurni.params.custom_contract.payment}', this._paymentCheckbox, SectionParam.COLLAPSED);

        this._rewardType = presetManager.createRadioGroup([new RadioButtonParam(0, '${wiredfurni.params.custom_contract.element_type_selection.0}'), new RadioButtonParam(1, '${wiredfurni.params.custom_contract.element_type_selection.1}')], (selected: number): void => this.onRewardTypeChanged(selected), 2);
        const rewardTypeSection = presetManager.createSection('${wiredfurni.params.custom_contract.element_type_selection}', this._rewardType);
        this._rewardAmount = presetManager.createValueOrVariableSection(1, this.mergedSourceOptions(1), '${wiredfurni.params.custom_contract.amount_selection}', 1, 100000);
        const rewardList = presetManager.createSimpleListView(true, [rewardTypeSection, presetManager.createSpacer(wiredStyle.sectionSpacing), this._rewardAmount]);
        rewardList.spacing = 0;
        const rewardOption = new CheckboxOptionParam('${wiredfurni.params.custom_contract.enable_reward}');
        rewardOption.extra2 = rewardList;
        this._rewardCheckbox = presetManager.createCheckboxGroup([rewardOption], (id: number, selected: boolean): void => this.onRewardSelectedChanged(id, selected));
        const rewardSection = presetManager.createSection('${wiredfurni.params.custom_contract.reward}', this._rewardCheckbox, SectionParam.COLLAPSED);

        builder.addElements(usageWarning, paymentSection, rewardSection, new WindowWrapperPreset(this.roomEvents, presetManager, wiredStyle, wiredStyle.createSplitterView(), false));
    }

    // AS3: _SafeCls_4381.as::get widthModifier()
    override get widthModifier(): number
    {
        return 1.2;
    }

    // AS3: _SafeCls_4381.as::onEditInitialized()
    override onEditInitialized(): void
    {
        this._paymentAmount.onEditInitialized();
        this._rewardAmount.onEditInitialized();
    }

    // AS3: _SafeCls_4381.as::onPaymentSelectedChanged()
    private onPaymentSelectedChanged(_id: number, _selected: boolean): void
    {
        this.roomEvents.wiredCtrl.updateSourceContainer(WiredInputSourcePicker.FURNI_SOURCE, 0);
        this.roomEvents.wiredCtrl.updateSourceContainer(WiredInputSourcePicker.MERGED_SOURCE, 0);
    }

    // AS3: _SafeCls_4381.as::onRewardSelectedChanged()
    private onRewardSelectedChanged(_id: number, _selected: boolean): void
    {
        this.roomEvents.wiredCtrl.updateSourceContainer(WiredInputSourcePicker.FURNI_SOURCE, 1);
        this.roomEvents.wiredCtrl.updateSourceContainer(WiredInputSourcePicker.MERGED_SOURCE, 1);
    }

    // AS3: _SafeCls_4381.as::onPaymentTypeChanged()
    private onPaymentTypeChanged(_selected: number): void
    {
        this.roomEvents.wiredCtrl.updateSourceContainer(WiredInputSourcePicker.FURNI_SOURCE, 0);
    }

    // AS3: _SafeCls_4381.as::onRewardTypeChanged()
    private onRewardTypeChanged(_selected: number): void
    {
        this.roomEvents.wiredCtrl.updateSourceContainer(WiredInputSourcePicker.FURNI_SOURCE, 1);
    }

    // AS3: _SafeCls_4381.as::isInputSourceDisabled()
    override isInputSourceDisabled(a: number, b: number): boolean
    {
        if(b === WiredInputSourcePicker.MERGED_SOURCE && a === 0)
        {
            return !this._paymentCheckbox.optionById(0).selected || this._paymentAmount.isSourcePickingDisabled();
        }

        if(b === WiredInputSourcePicker.MERGED_SOURCE && a === 1)
        {
            return !this._rewardCheckbox.optionById(0).selected || this._rewardAmount.isSourcePickingDisabled();
        }

        if(b === WiredInputSourcePicker.FURNI_SOURCE && a === 0)
        {
            return !this._paymentCheckbox.optionById(0).selected || this._paymentType.selected !== TradeRequirementNode.TYPE_FURNI;
        }

        if(b === WiredInputSourcePicker.FURNI_SOURCE && a === 1)
        {
            return !this._rewardCheckbox.optionById(0).selected || this._rewardType.selected !== TradeRequirementNode.TYPE_FURNI;
        }

        return false;
    }

    // AS3: _SafeCls_4381.as::mergedSelectionTitle()
    override mergedSelectionTitle(id: number): string
    {
        if(id === 0)
        {
            return 'wiredfurni.params.sources.merged.title.variables_reference_payment';
        }

        return 'wiredfurni.params.sources.merged.title.variables_reference_reward';
    }

    // AS3: _SafeCls_4381.as::furniSelectionTitle()
    override furniSelectionTitle(id: number): string
    {
        if(id === 0)
        {
            return 'wiredfurni.params.sources.furni.title.payment';
        }

        return 'wiredfurni.params.sources.furni.title.reward';
    }

    // AS3: _SafeCls_4381.as::mergedSelections()
    override mergedSelections(): number[][]
    {
        return [[2, 0], [3, 1]];
    }

    // AS3: _SafeCls_4381.as::setMergedType()
    override setMergedType(a: number, b: number): void
    {
        if(a === 0)
        {
            this._paymentAmount.target = b;
        }
        else
        {
            this._rewardAmount.target = b;
        }
    }

    // AS3: _SafeCls_4381.as::getMergedType()
    override getMergedType(id: number): number
    {
        if(id === 0)
        {
            return this._paymentAmount.target;
        }

        return this._rewardAmount.target;
    }

    // AS3: _SafeCls_4381.as::get forceHidePickFurniInstructions()
    override get forceHidePickFurniInstructions(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4381.as::getCustomSourcesForMergedType()
    override getCustomSourcesForMergedType(_id: number): number[]
    {
        return [VariableExtraSourceTypes.GLOBAL_SOURCE, VariableExtraSourceTypes.CONTEXT_SOURCE];
    }

    // AS3: _SafeCls_4381.as::hasCustomTypePicker()
    override hasCustomTypePicker(_id: number): boolean
    {
        return true;
    }
}
