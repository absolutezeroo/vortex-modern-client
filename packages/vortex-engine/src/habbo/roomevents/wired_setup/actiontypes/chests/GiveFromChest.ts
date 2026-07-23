import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';

import {DefaultElement} from '../../DefaultElement';
import {VariableExtraSourceTypes} from '../../common/VariableExtraSourceTypes';
import {WiredInputSourcePicker} from '../../inputsources/WiredInputSourcePicker';
import type {PresetManager} from '../../uibuilder/PresetManager';
import type {WiredStyle} from '../../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../../uibuilder/WiredUIBuilder';
import {CheckboxOptionParam} from '../../uibuilder/params/CheckboxOptionParam';
import {RadioButtonParam} from '../../uibuilder/params/RadioButtonParam';
import {TextAreaParam} from '../../uibuilder/params/TextAreaParam';
import type {CheckboxGroupPreset} from '../../uibuilder/presets/CheckboxGroupPreset';
import type {RadioGroupPreset} from '../../uibuilder/presets/RadioGroupPreset';
import type {SectionPreset} from '../../uibuilder/presets/SectionPreset';
import type {TextAreaPreset} from '../../uibuilder/presets/TextAreaPreset';
import type {ValueOrVariableSection} from '../../uibuilder/presets/sections/ValueOrVariableSection';
import {DefaultActionType} from '../DefaultActionType';

/**
 * GiveFromChest — abstract base for the "give … from chest" reward actions (GiveCurrencyFromChest,
 * GiveFurniFromChest). Builds a rewarding-mode radio (amount vs all), a value-or-variable amount
 * section, and a reward-popup section (text area + show-by-default checkbox). Amount/option/target and
 * the show-by-default flag go to intParams; the popup text to stringParam; the amount variable to
 * variableIds[0]. The furni "source" is the chest(s); merged selection references a variable.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4281`, no real name in any tree) — named for
 * the two concrete subclasses it factors. It is abstract (no `code` override) and never registered.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/chests/_SafeCls_4281.as
 */
export class GiveFromChest extends DefaultActionType
{
    // AS3: _SafeCls_4281.as::MODE_AMOUNT
    protected static readonly MODE_AMOUNT: number = 0;

    // AS3: _SafeCls_4281.as::MODE_ALL
    protected static readonly MODE_ALL: number = 1;

    // AS3: _SafeCls_4281.as::_SafeStr_9230 (name derived: the rewarding-mode section)
    private _rewardingModeSection!: SectionPreset;

    // AS3: _SafeCls_4281.as::_SafeStr_5081 (name derived: the amount value-or-variable section)
    private _amountSection!: ValueOrVariableSection;

    // AS3: _SafeCls_4281.as::_SafeStr_8837 (name derived: the reward-popup section)
    private _popupSection!: SectionPreset;

    // AS3: _SafeCls_4281.as::_rewardingModeRadioGroup
    private _rewardingModeRadioGroup!: RadioGroupPreset;

    // AS3: _SafeCls_4281.as::_SafeStr_7642 (name derived: the reward-popup text area)
    private _popupText!: TextAreaPreset;

    // AS3: _SafeCls_4281.as::_showByDefault
    private _showByDefault!: CheckboxGroupPreset;

    // AS3: _SafeCls_4281.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];

        params.push(this._rewardingModeRadioGroup.selected);
        params.push(this._amountSection.numberValue);
        params.push(this._amountSection.option);
        params.push(this._amountSection.target);
        // AS3 pushes the Boolean directly; serialized as 0/1 on the wire.
        params.push(this._showByDefault.optionById(0).selected ? 1 : 0);

        return params;
    }

    // AS3: _SafeCls_4281.as::readVariableIdsFromForm()
    override readVariableIdsFromForm(): string[]
    {
        return [this._amountSection.finalizeSelection];
    }

    // AS3: _SafeCls_4281.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._popupText.text;
    }

    // AS3: _SafeCls_4281.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        let variableId = def.variableIds[0];
        const mode = def.getInt(0);
        this._rewardingModeRadioGroup.selected = mode;
        let value = def.getInt(1);
        const option = def.getInt(2);
        const target = def.getInt(3);

        if(mode === GiveFromChest.MODE_AMOUNT)
        {
            if(option === 0)
            {
                variableId = WiredVariable.DEFAULT_VARIABLE_ID;
            }
            else
            {
                value = 1;
            }
        }
        else
        {
            variableId = WiredVariable.DEFAULT_VARIABLE_ID;
            value = 1;
        }

        this._amountSection.disabled = mode === GiveFromChest.MODE_ALL;
        this._amountSection.init(def.wiredContext.roomVariablesList, variableId, target, option, value);
        this._showByDefault.optionById(0).selected = def.getBoolean(4);
        this._popupText.text = def.stringParam;
    }

    // AS3: _SafeCls_4281.as::get rewardingMode()
    protected get rewardingMode(): number
    {
        return this._rewardingModeRadioGroup.selected;
    }

    // AS3: _SafeCls_4281.as::onEditInitialized()
    override onEditInitialized(): void
    {
        this._amountSection.onEditInitialized();
    }

    // AS3: _SafeCls_4281.as::isInputSourceDisabled()
    override isInputSourceDisabled(a: number, b: number): boolean
    {
        if(b === WiredInputSourcePicker.MERGED_SOURCE && a === 0)
        {
            return this._amountSection.isSourcePickingDisabled() || this._amountSection.disabled;
        }

        return false;
    }

    // AS3: _SafeCls_4281.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4281.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const modeParams = [new RadioButtonParam(0, this.l('rewarding_mode.0')), new RadioButtonParam(1, this.l('rewarding_mode.1'))];
        this._rewardingModeRadioGroup = presetManager.createRadioGroup(modeParams, (selected: number): void => this.onModeChange(selected));
        this._rewardingModeSection = presetManager.createSection(this.l('rewarding_mode'), this._rewardingModeRadioGroup);
        this._amountSection = presetManager.createValueOrVariableSection(0, this.mergedSourceOptions(0), this.l('amount_to_give'), 1, 2147483647);
        this._popupText = presetManager.createTextArea(new TextAreaParam(45, -1, 3, -1, 200, '', '${wiredfurni.reward_contract.reward_popup.text.tooltip}'));
        this._showByDefault = presetManager.createCheckboxGroup([new CheckboxOptionParam('${wiredfurni.reward_contract.reward_popup.show_by_default}')]);
        const popupList = presetManager.createSimpleListView(true, [this._popupText, this._showByDefault]);
        this._popupSection = presetManager.createSection('${wiredfurni.reward_contract.reward_popup}', popupList);
        this.finalizeBuilding(builder);
    }

    // AS3: _SafeCls_4281.as::finalizeBuilding()
    protected finalizeBuilding(builder: WiredUIBuilder): void
    {
        builder.addElements(this._rewardingModeSection, this._amountSection, this._popupSection);
    }

    // AS3: _SafeCls_4281.as::onModeChange()
    protected onModeChange(mode: number): void
    {
        this._amountSection.disabled = mode === GiveFromChest.MODE_ALL;
        this.roomEvents.wiredCtrl.updateSourceContainer(WiredInputSourcePicker.MERGED_SOURCE, 0);
    }

    // AS3: _SafeCls_4281.as::mergedSelectionTitle()
    override mergedSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.merged.title.variables_reference';
    }

    // AS3: _SafeCls_4281.as::furniSelectionTitle()
    override furniSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.furni.title.chests';
    }

    // AS3: _SafeCls_4281.as::userSelectionTitle()
    override userSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.users.title.reward_user';
    }

    // AS3: _SafeCls_4281.as::get forceHidePickFurniInstructions()
    override get forceHidePickFurniInstructions(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4281.as::mergedSelections()
    override mergedSelections(): number[][]
    {
        return [[1, 1]];
    }

    // AS3: _SafeCls_4281.as::setMergedType()
    override setMergedType(_a: number, b: number): void
    {
        this._amountSection.target = b;
    }

    // AS3: _SafeCls_4281.as::getMergedType()
    override getMergedType(_id: number): number
    {
        return this._amountSection.target;
    }

    // AS3: _SafeCls_4281.as::getCustomSourcesForMergedType()
    override getCustomSourcesForMergedType(_id: number): number[]
    {
        return [VariableExtraSourceTypes.GLOBAL_SOURCE, VariableExtraSourceTypes.CONTEXT_SOURCE];
    }

    // AS3: _SafeCls_4281.as::hasCustomTypePicker()
    override hasCustomTypePicker(_id: number): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4281.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }
}
