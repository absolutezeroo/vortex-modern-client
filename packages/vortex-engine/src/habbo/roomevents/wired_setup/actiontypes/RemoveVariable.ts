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
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * RemoveVariable — the "remove a wired variable" action: a variable picker (restricted to
 * creatable/deletable variables) with a source-type selector; the picked variable id goes to
 * variableIds[0], its target to intParams[0].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4219`; the name follows the code it returns
 * (ActionTypeCodes.REMOVE_VARIABLE). Body mirrors the condition HasVariable.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4219.as
 */
export class RemoveVariable extends DefaultActionType
{
    // AS3: _SafeCls_4219.as::_picker
    private _picker!: VariablePickerPreset;

    // AS3: _SafeCls_4219.as::_section1
    private _section1!: SectionPreset;

    // AS3: _SafeCls_4219.as::_SafeStr_5920 (name derived: the current variable target)
    private _target: number = 0;

    // AS3: _SafeCls_4219.as::variableSelectionFilter()
    private static variableSelectionFilter(variable: WiredVariable): boolean
    {
        return variable.canCreateAndDelete;
    }

    // AS3: _SafeCls_4219.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.REMOVE_VARIABLE;
    }

    // AS3: _SafeCls_4219.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._target];
    }

    // AS3: _SafeCls_4219.as::readVariableIdsFromForm()
    override readVariableIdsFromForm(): string[]
    {
        return [this._picker.finalizeSelection];
    }

    // AS3: _SafeCls_4219.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const variableId = def.variableIds[0];
        this._target = def.getInt(0);
        this._picker.init(def.wiredContext.roomVariablesList, variableId, this._target);
    }

    // AS3: _SafeCls_4219.as::onEditInitialized()
    override onEditInitialized(): void
    {
        this._section1.getSourceTypeSelector()!.select(this._target);
    }

    // AS3: _SafeCls_4219.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4219.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const sourceTypeParam = new SourceTypeSelectorParam(this.mergedSourceOptions(0), this.createSourceTypeListener(0));
        this._picker = presetManager.createVariablePicker(RemoveVariable.variableSelectionFilter);
        const sectionParam = new SectionParam(sourceTypeParam);
        this._section1 = presetManager.createSection(this.loc('wiredfurni.params.variables.variable_selection'), this._picker, sectionParam);
        builder.addElements(this._section1);
    }

    // AS3: _SafeCls_4219.as::mergedSelectionTitle()
    override mergedSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.merged.title.variables';
    }

    // AS3: _SafeCls_4219.as::mergedSelections()
    override mergedSelections(): number[][]
    {
        return [[0, 0]];
    }

    // AS3: _SafeCls_4219.as::setMergedType()
    override setMergedType(_a: number, b: number): void
    {
        this._target = b;
        this._picker.variableTarget = this._target;
    }

    // AS3: _SafeCls_4219.as::getMergedType()
    override getMergedType(_id: number): number
    {
        return this._target;
    }

    // AS3: _SafeCls_4219.as::hasCustomTypePicker()
    override hasCustomTypePicker(_id: number): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4219.as::getCustomSourcesForMergedType()
    override getCustomSourcesForMergedType(_id: number): number[]
    {
        return [VariableExtraSourceTypes.CONTEXT_SOURCE];
    }

    // AS3: _SafeCls_4219.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4219.as::get forceHidePickFurniInstructions()
    override get forceHidePickFurniInstructions(): boolean
    {
        return true;
    }
}
