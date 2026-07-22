import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';

import {DefaultElement} from '../DefaultElement';
import {VariableExtraSourceTypes} from '../common/VariableExtraSourceTypes';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {SectionParam} from '../uibuilder/params/SectionParam';
import {SourceTypeSelectorParam} from '../uibuilder/params/SourceTypeSelectorParam';
import type {SectionPreset} from '../uibuilder/presets/SectionPreset';
import type {VariablePickerPreset} from '../uibuilder/presets/VariablePickerPreset';
import {ConditionCodes} from './ConditionCodes';
import {DefaultConditionType} from './DefaultConditionType';

/**
 * HasVariable — the "furni has a given wired variable" condition: a variable picker (restricted to
 * non-always-available variables) with a source-type selector; the picked variable id goes to
 * variableIds[0], its target to intParams[0].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4236`; the name follows the code it returns
 * (ConditionCodes.HAS_VARIABLE). Body mirrors the action RemoveVariable.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/_SafeCls_4236.as
 */
export class HasVariable extends DefaultConditionType
{
    // AS3: _SafeCls_4236.as::_picker
    private _picker!: VariablePickerPreset;

    // AS3: _SafeCls_4236.as::_section1
    private _section1!: SectionPreset;

    // AS3: _SafeCls_4236.as::_SafeStr_5920 (name derived: the current variable target)
    private _target: number = 0;

    // AS3: _SafeCls_4236.as::variableSelectionFilter()
    private static variableSelectionFilter(variable: WiredVariable): boolean
    {
        return !variable.alwaysAvailable;
    }

    // AS3: _SafeCls_4236.as::get code()
    override get code(): number
    {
        return ConditionCodes.HAS_VARIABLE;
    }

    // AS3: _SafeCls_4236.as::get negativeCode()
    override get negativeCode(): number
    {
        return ConditionCodes.NOT_HAS_VARIABLE;
    }

    // AS3: _SafeCls_4236.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._target];
    }

    // AS3: _SafeCls_4236.as::readVariableIdsFromForm()
    override readVariableIdsFromForm(): string[]
    {
        return [this._picker.finalizeSelection];
    }

    // AS3: _SafeCls_4236.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const variableId = def.variableIds[0];
        this._target = def.intParams[0];
        this._picker.init(def.wiredContext.roomVariablesList, variableId, this._target);
    }

    // AS3: _SafeCls_4236.as::onEditInitialized()
    override onEditInitialized(): void
    {
        this._section1.getSourceTypeSelector()!.select(this._target);
    }

    // AS3: _SafeCls_4236.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4236.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const sourceTypeParam = new SourceTypeSelectorParam(this.mergedSourceOptions(0), this.createSourceTypeListener(0));
        this._picker = presetManager.createVariablePicker(HasVariable.variableSelectionFilter);
        const sectionParam = new SectionParam(sourceTypeParam);
        this._section1 = presetManager.createSection(this.loc('wiredfurni.params.variables.variable_selection'), this._picker, sectionParam);
        builder.addElements(this._section1);
    }

    // AS3: _SafeCls_4236.as::mergedSelectionTitle()
    override mergedSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.merged.title.variables';
    }

    // AS3: _SafeCls_4236.as::mergedSelections()
    override mergedSelections(): number[][]
    {
        return [[0, 0]];
    }

    // AS3: _SafeCls_4236.as::setMergedType()
    override setMergedType(_a: number, b: number): void
    {
        this._target = b;
        this._picker.variableTarget = this._target;
    }

    // AS3: _SafeCls_4236.as::getMergedType()
    override getMergedType(_id: number): number
    {
        return this._target;
    }

    // AS3: _SafeCls_4236.as::hasCustomTypePicker()
    override hasCustomTypePicker(_id: number): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4236.as::getCustomSourcesForMergedType()
    override getCustomSourcesForMergedType(_id: number): number[]
    {
        return [VariableExtraSourceTypes.CONTEXT_SOURCE];
    }

    // AS3: _SafeCls_4236.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4236.as::get forceHidePickFurniInstructions()
    override get forceHidePickFurniInstructions(): boolean
    {
        return true;
    }
}
