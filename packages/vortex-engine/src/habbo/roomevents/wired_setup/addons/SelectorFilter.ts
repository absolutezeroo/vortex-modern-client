import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';

import {DefaultElement} from '../DefaultElement';
import {VariableExtraSourceTypes} from '../common/VariableExtraSourceTypes';
import {WiredInputSourcePicker} from '../inputsources/WiredInputSourcePicker';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import type {ValueOrVariableSection} from '../uibuilder/presets/sections/ValueOrVariableSection';
import {DefaultAddonType} from './DefaultAddonType';

/**
 * SelectorFilter — abstract base for the wired selector-filter addons (furni/user selector filters): a
 * single value-or-variable section ("setfilter", 1..1000) marking the addon as a filter. Concrete
 * subclasses only supply the server code.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/SelectorFilter.as
 */
export class SelectorFilter extends DefaultAddonType
{
    // AS3: SelectorFilter.as::_section1
    protected _section1!: ValueOrVariableSection;

    // AS3: SelectorFilter.as::get isFilter()
    override get isFilter(): boolean
    {
        return true;
    }

    // AS3: SelectorFilter.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];

        params.push(this._section1.numberValue);
        params.push(this._section1.option);
        params.push(this._section1.target);

        return params;
    }

    // AS3: SelectorFilter.as::readVariableIdsFromForm()
    override readVariableIdsFromForm(): string[]
    {
        return [this._section1.finalizeSelection];
    }

    // AS3: SelectorFilter.as::onEditStart()
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

        this._section1.init(def.wiredContext.roomVariablesList, variableId, target, option, value);
    }

    // AS3: SelectorFilter.as::onEditInitialized()
    override onEditInitialized(): void
    {
        this._section1.onEditInitialized();
    }

    // AS3: SelectorFilter.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: SelectorFilter.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._section1 = presetManager.createValueOrVariableSection(0, this.mergedSourceOptions(0), this.l('setfilter'), 1, 1000);
        builder.addElements(this._section1);
    }

    // AS3: SelectorFilter.as::isInputSourceDisabled()
    override isInputSourceDisabled(_a: number, b: number): boolean
    {
        if(b === WiredInputSourcePicker.MERGED_SOURCE)
        {
            return this._section1.isSourcePickingDisabled();
        }

        return false;
    }

    // AS3: SelectorFilter.as::mergedSelectionTitle()
    override mergedSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.merged.title.variables_reference';
    }

    // AS3: SelectorFilter.as::mergedSelections()
    override mergedSelections(): number[][]
    {
        return [[0, 0]];
    }

    // AS3: SelectorFilter.as::setMergedType()
    override setMergedType(_a: number, b: number): void
    {
        this._section1.target = b;
    }

    // AS3: SelectorFilter.as::getMergedType()
    override getMergedType(_id: number): number
    {
        return this._section1.target;
    }

    // AS3: SelectorFilter.as::getCustomSourcesForMergedType()
    override getCustomSourcesForMergedType(_id: number): number[]
    {
        return [VariableExtraSourceTypes.GLOBAL_SOURCE, VariableExtraSourceTypes.CONTEXT_SOURCE];
    }

    // AS3: SelectorFilter.as::hasCustomTypePicker()
    override hasCustomTypePicker(_id: number): boolean
    {
        return true;
    }

    // AS3: SelectorFilter.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }

    // AS3: SelectorFilter.as::get forceHidePickFurniInstructions()
    override get forceHidePickFurniInstructions(): boolean
    {
        return true;
    }
}
