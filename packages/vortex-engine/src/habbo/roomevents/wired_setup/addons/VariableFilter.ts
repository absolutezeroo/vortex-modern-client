import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';

import {DefaultElement} from '../DefaultElement';
import {VariableExtraSourceTypes} from '../common/VariableExtraSourceTypes';
import {ExpandableDropdownOption} from '../common/advanced_dropdown/ExpandableDropdownOption';
import {WiredInputSourcePicker} from '../inputsources/WiredInputSourcePicker';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {DropdownParam} from '../uibuilder/params/DropdownParam';
import type {DropdownPreset} from '../uibuilder/presets/DropdownPreset';
import type {SectionPreset} from '../uibuilder/presets/SectionPreset';
import type {VariablePickerPreset} from '../uibuilder/presets/VariablePickerPreset';
import type {ValueOrVariableSection} from '../uibuilder/presets/sections/ValueOrVariableSection';
import {DefaultAddonType} from './DefaultAddonType';

/**
 * VariableFilter — abstract base for the wired variable-filter addons (furni/user variable filters): a
 * variable picker (scoped to the subclass's variable holder type) + a sort-by dropdown (whose options
 * depend on the picked variable's readable timestamps) + a value-or-variable filter section. Concrete
 * subclasses supply the variable holder type and the server code.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/_SafeCls_4253.as
 */
export class VariableFilter extends DefaultAddonType
{
    // AS3: _SafeCls_4253.as::_section1
    protected _section1!: SectionPreset;

    // AS3: _SafeCls_4253.as::_SafeStr_7491 (name derived: the variable picker)
    protected _picker!: VariablePickerPreset;

    // AS3: _SafeCls_4253.as::_section2
    protected _section2!: SectionPreset;

    // AS3: _SafeCls_4253.as::_SafeStr_7425 (name derived: the sort-by dropdown)
    protected _sortDropdown!: DropdownPreset;

    // AS3: _SafeCls_4253.as::_section3
    protected _section3!: ValueOrVariableSection;

    // AS3: _SafeCls_4253.as::variableSelectionFilter()
    private static variableSelectionFilter(variable: WiredVariable): boolean
    {
        return variable.hasValue || variable.canReadCreationTime || variable.canReadLastUpdateTime;
    }

    // AS3: _SafeCls_4253.as::get variableType() — the picker's holder type (overridden by subclasses).
    protected get variableType(): number
    {
        return -1;
    }

    // AS3: _SafeCls_4253.as::get isFilter()
    override get isFilter(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4253.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];

        params.push(this._section3.numberValue);
        params.push(this._sortDropdown.selectedId);
        params.push(this._section3.option);
        params.push(this._section3.target);

        return params;
    }

    // AS3: _SafeCls_4253.as::readVariableIdsFromForm()
    override readVariableIdsFromForm(): string[]
    {
        return [this._picker.finalizeSelection, this._section3.finalizeSelection];
    }

    // AS3: _SafeCls_4253.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const variableId0 = def.variableIds[0];
        let variableId1 = def.variableIds[1];
        let value = def.getInt(0);
        const sortBy = def.getInt(1);
        const option = def.getInt(2);
        const referenceTarget = def.getInt(3);

        this._picker.init(def.wiredContext.roomVariablesList, variableId0, this.variableType);

        if(option === 0)
        {
            variableId1 = WiredVariable.DEFAULT_VARIABLE_ID;
        }
        else
        {
            value = 1;
        }

        this._section3.init(def.wiredContext.roomVariablesList, variableId1, referenceTarget, option, value);
        this.initSortingDropdown(this._picker.selected, sortBy);
    }

    // AS3: _SafeCls_4253.as::onEditInitialized()
    override onEditInitialized(): void
    {
        this._section3.onEditInitialized();
    }

    // AS3: _SafeCls_4253.as::initSortingDropdown() — bound (passed as the picker's onSelect callback).
    private initSortingDropdown = (variable: WiredVariable | null, selectedId: number = -1): void =>
    {
        if(selectedId === -1)
        {
            selectedId = this._sortDropdown.selectedId;
        }

        const options: ExpandableDropdownOption[] = [];

        if(variable === null || variable.hasValue)
        {
            options.push(new ExpandableDropdownOption(0, this.l('variables.sort_by.0')));
            options.push(new ExpandableDropdownOption(1, this.l('variables.sort_by.1')));
        }

        if(variable === null || variable.canReadCreationTime)
        {
            options.push(new ExpandableDropdownOption(2, this.l('variables.sort_by.2')));
            options.push(new ExpandableDropdownOption(3, this.l('variables.sort_by.3')));
        }

        if(variable === null || variable.canReadLastUpdateTime)
        {
            options.push(new ExpandableDropdownOption(4, this.l('variables.sort_by.4')));
            options.push(new ExpandableDropdownOption(5, this.l('variables.sort_by.5')));
        }

        this._sortDropdown.reinit(options, selectedId);
    };

    // AS3: _SafeCls_4253.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4253.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._picker = presetManager.createVariablePicker(VariableFilter.variableSelectionFilter, this.initSortingDropdown);
        this._section1 = presetManager.createSection(this.loc('wiredfurni.params.variables.variable_selection'), this._picker);
        this._sortDropdown = presetManager.createDropdown(new DropdownParam(this.l('variables.sort_by.caption'), []));
        this._section2 = presetManager.createSection(this.l('variables.sort_by'), this._sortDropdown);
        this._section3 = presetManager.createValueOrVariableSection(0, this.mergedSourceOptions(0), this.l('setfilter'), 1, 1000);
        builder.addElements(this._section1, this._section2, this._section3);
    }

    // AS3: _SafeCls_4253.as::isInputSourceDisabled()
    override isInputSourceDisabled(_a: number, b: number): boolean
    {
        if(b === WiredInputSourcePicker.MERGED_SOURCE)
        {
            return this._section3.isSourcePickingDisabled();
        }

        return false;
    }

    // AS3: _SafeCls_4253.as::mergedSelectionTitle()
    override mergedSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.merged.title.variables_reference';
    }

    // AS3: _SafeCls_4253.as::mergedSelections()
    override mergedSelections(): number[][]
    {
        return [[0, 0]];
    }

    // AS3: _SafeCls_4253.as::setMergedType()
    override setMergedType(_a: number, b: number): void
    {
        this._section3.target = b;
    }

    // AS3: _SafeCls_4253.as::getMergedType()
    override getMergedType(_id: number): number
    {
        return this._section3.target;
    }

    // AS3: _SafeCls_4253.as::getCustomSourcesForMergedType()
    override getCustomSourcesForMergedType(_id: number): number[]
    {
        return [VariableExtraSourceTypes.GLOBAL_SOURCE, VariableExtraSourceTypes.CONTEXT_SOURCE];
    }

    // AS3: _SafeCls_4253.as::hasCustomTypePicker()
    override hasCustomTypePicker(_id: number): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4253.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4253.as::get forceHidePickFurniInstructions()
    override get forceHidePickFurniInstructions(): boolean
    {
        return true;
    }
}
