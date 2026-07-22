import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {Util} from '@habbo/roomevents/Util';

import {DefaultElement} from '../DefaultElement';
import {VariableExtraSourceTypes} from '../common/VariableExtraSourceTypes';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import type {ChooseVariableSection} from '../uibuilder/presets/sections/ChooseVariableSection';
import type {PlaceholderNameSection} from '../uibuilder/presets/sections/PlaceholderNameSection';
import type {PlaceholderTypeSection} from '../uibuilder/presets/sections/PlaceholderTypeSection';
import type {VariablePlaceholderModeSection} from '../uibuilder/presets/sections/VariablePlaceholderModeSection';
import {AddonCodes} from './AddonCodes';
import {DefaultAddonType} from './DefaultAddonType';

/**
 * VariablePlaceholder — the "display a variable via a placeholder" wired addon: a placeholder-name
 * section, a choose-variable section (variables that hold a value), a text/value placeholder-mode
 * section, and a placeholder-type section (single vs multiple, with a delimiter). Name (+ optional
 * "\t"delimiter) goes to stringParam; show-multiple/target/text-mode to intParams; the variable id to
 * variableIds[0].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4354`; the name follows the code it returns
 * (AddonCodes.VARIABLE_PLACEHOLDER).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/_SafeCls_4354.as
 */
export class VariablePlaceholder extends DefaultAddonType
{
    // AS3: _SafeCls_4354.as::_SafeStr_6038 (name derived: the placeholder-name section)
    private _placeholderName!: PlaceholderNameSection;

    // AS3: _SafeCls_4354.as::_SafeStr_5259 (name derived: the choose-variable section)
    private _chooseVariable!: ChooseVariableSection;

    // AS3: _SafeCls_4354.as::_SafeStr_6479 (name derived: the placeholder-mode section)
    private _modeSection!: VariablePlaceholderModeSection;

    // AS3: _SafeCls_4354.as::_SafeStr_5820 (name derived: the placeholder-type section)
    private _typeSection!: PlaceholderTypeSection;

    // AS3: _SafeCls_4354.as::_SafeStr_7007 (name derived: the currently selected variable)
    private _currentVariable: WiredVariable | null = null;

    // AS3: _SafeCls_4354.as::variableSelectionFilter()
    private static variableSelectionFilter(variable: WiredVariable): boolean
    {
        return variable.hasValue;
    }

    // AS3: _SafeCls_4354.as::prettifiedName()
    private static prettifiedName(variable: WiredVariable | null): string
    {
        if(variable === null)
        {
            return '';
        }

        return Util.flatVariableName(variable);
    }

    // AS3: _SafeCls_4354.as::get code()
    override get code(): number
    {
        return AddonCodes.VARIABLE_PLACEHOLDER;
    }

    // AS3: _SafeCls_4354.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4354.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._placeholderName = presetManager.createPlaceholderNameSection(this.l('texts.placeholder_name'), '$');
        this._chooseVariable = presetManager.createChooseVariableSection(0, this.mergedSourceOptions(0), VariablePlaceholder.variableSelectionFilter, this.onChangeVariable);
        this._modeSection = presetManager.createVariablePlaceholderModeSection(this.l('texts.variable_display_type'));
        this._typeSection = presetManager.createPlaceholderTypeSection();
        builder.addElements(this._placeholderName, this._chooseVariable, this._modeSection, this._typeSection);
    }

    // AS3: _SafeCls_4354.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const parts = def.stringParam.split('\t');
        const placeholderName = parts[0];
        const delimiter = parts.length > 1 ? parts[1] : '';
        const variableId = def.variableIds[0];
        const showMultiple = def.getBoolean(0);
        const target = def.getInt(1);
        const isTextMode = def.getBoolean(2);

        this._modeSection.isTextMode = isTextMode;
        this._placeholderName.placeholderName = placeholderName;
        this._typeSection.isShowMultiple = showMultiple;
        this._typeSection.delimiter = delimiter;
        this._chooseVariable.init(def.wiredContext.roomVariablesList, variableId, target);
        this._currentVariable = this._chooseVariable.selected;
        this.onChangeVariable(this._chooseVariable.selected);
        this.updateMultipleOptionVisibility();
    }

    // AS3: _SafeCls_4354.as::onEditInitialized()
    override onEditInitialized(): void
    {
        this._chooseVariable.onEditInitialized();
    }

    // AS3: _SafeCls_4354.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._typeSection.isShowMultiple ? 1 : 0, this._chooseVariable.target, this._modeSection.isTextMode ? 1 : 0];
    }

    // AS3: _SafeCls_4354.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        if(!this._typeSection.isShowMultiple)
        {
            return this._placeholderName.placeholderName;
        }

        return this._placeholderName.placeholderName + '\t' + this._typeSection.delimiter;
    }

    // AS3: _SafeCls_4354.as::readVariableIdsFromForm()
    override readVariableIdsFromForm(): string[]
    {
        return [this._chooseVariable.finalizeSelection];
    }

    // AS3: _SafeCls_4354.as::onChangeVariable() — bound (passed as the choose-section's onSelect).
    private onChangeVariable = (variable: WiredVariable | null): void =>
    {
        const noTextConnector = variable === null || !variable.hasTextConnector;
        this._modeSection.radioAt(1).disabled = noTextConnector;

        if(noTextConnector)
        {
            this._modeSection.isTextMode = false;
        }

        if(this._placeholderName.placeholderName === '' || (this._currentVariable !== null && VariablePlaceholder.prettifiedName(this._currentVariable) === this._placeholderName.placeholderName))
        {
            this._placeholderName.placeholderName = VariablePlaceholder.prettifiedName(variable);
        }

        this._currentVariable = variable;
    };

    // AS3: _SafeCls_4354.as::updateMultipleOptionVisibility()
    private updateMultipleOptionVisibility(): void
    {
        const disabled = this._chooseVariable.target === VariableExtraSourceTypes.CONTEXT_SOURCE || this._chooseVariable.target === VariableExtraSourceTypes.GLOBAL_SOURCE;
        this._typeSection.radioAt(1).disabled = disabled;

        if(disabled)
        {
            this._typeSection.isShowMultiple = false;
        }
    }

    // AS3: _SafeCls_4354.as::mergedSelectionTitle()
    override mergedSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.merged.title.variables';
    }

    // AS3: _SafeCls_4354.as::mergedSelections()
    override mergedSelections(): number[][]
    {
        return [[0, 0]];
    }

    // AS3: _SafeCls_4354.as::setMergedType()
    override setMergedType(_a: number, b: number): void
    {
        this._chooseVariable.target = b;
        this.updateMultipleOptionVisibility();
    }

    // AS3: _SafeCls_4354.as::getMergedType()
    override getMergedType(_id: number): number
    {
        return this._chooseVariable.target;
    }

    // AS3: _SafeCls_4354.as::getCustomSourcesForMergedType()
    override getCustomSourcesForMergedType(_id: number): number[]
    {
        return [VariableExtraSourceTypes.GLOBAL_SOURCE, VariableExtraSourceTypes.CONTEXT_SOURCE];
    }

    // AS3: _SafeCls_4354.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4354.as::get forceHidePickFurniInstructions()
    override get forceHidePickFurniInstructions(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4354.as::hasCustomTypePicker()
    override hasCustomTypePicker(_id: number): boolean
    {
        return true;
    }
}
