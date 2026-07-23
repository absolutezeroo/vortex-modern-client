import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';

import {DefaultElement} from '../../DefaultElement';
import {VariableExtraSourceTypes} from '../../common/VariableExtraSourceTypes';
import type {PresetManager} from '../../uibuilder/PresetManager';
import type {WiredStyle} from '../../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../../uibuilder/params/RadioButtonParam';
import {SectionParam} from '../../uibuilder/params/SectionParam';
import type {RadioGroupPreset} from '../../uibuilder/presets/RadioGroupPreset';
import type {ChooseVariableSection} from '../../uibuilder/presets/sections/ChooseVariableSection';
import {AddonCodes} from '../AddonCodes';
import {DefaultAddonType} from '../DefaultAddonType';

/**
 * ChestItemTypeScanner — the "scan chest item types into a variable" addon: a usage-info section, a
 * choose-variable section (writable, create/deletable, value-holding variables only) and a scanning-mode
 * radio. The scanning mode goes to intParams[0]; the target variable to variableIds[0]. The furni source
 * is the item-type list (falling back to chests).
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4054`). Code = AddonCodes.CHEST_ITEM_TYPE_SCANNER.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/chests/_SafeCls_4054.as
 */
export class ChestItemTypeScanner extends DefaultAddonType
{
    // AS3: _SafeCls_4054.as::_SafeStr_5259 (name derived: the choose-variable section)
    private _variableSection!: ChooseVariableSection;

    // AS3: _SafeCls_4054.as::_scanningMode
    private _scanningMode!: RadioGroupPreset;

    // AS3: _SafeCls_4054.as::variableSelectionFilter()
    private static variableSelectionFilter(variable: WiredVariable): boolean
    {
        return variable.hasValue && variable.canCreateAndDelete && variable.canWriteValue;
    }

    // AS3: _SafeCls_4054.as::get code()
    override get code(): number
    {
        return AddonCodes.CHEST_ITEM_TYPE_SCANNER;
    }

    // AS3: _SafeCls_4054.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4054.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const usageInfo = presetManager.createUsageInfoSection('${wiredfurni.params.chest_item_type_scanner.info}');
        this._variableSection = presetManager.createChooseVariableSection(0, null, ChestItemTypeScanner.variableSelectionFilter);
        this._scanningMode = presetManager.createRadioGroup([new RadioButtonParam(0, '${wiredfurni.params.chest_item_type_scanner.0}'), new RadioButtonParam(1, '${wiredfurni.params.chest_item_type_scanner.1}')]);
        const modeSection = presetManager.createSection('${wiredfurni.params.chest_item_type_scanner}', this._scanningMode, SectionParam.COLLAPSED);
        builder.addElements(usageInfo, this._variableSection, modeSection);
    }

    // AS3: _SafeCls_4054.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const variableId = def.variableIds[0];
        this._variableSection.init(def.wiredContext.roomVariablesList, variableId, VariableExtraSourceTypes.CONTEXT_SOURCE);
        this._scanningMode.selected = def.getInt(0);
    }

    // AS3: _SafeCls_4054.as::onEditInitialized()
    override onEditInitialized(): void
    {
        this._variableSection.onEditInitialized();
    }

    // AS3: _SafeCls_4054.as::readVariableIdsFromForm()
    override readVariableIdsFromForm(): string[]
    {
        return [this._variableSection.finalizeSelection];
    }

    // AS3: _SafeCls_4054.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._scanningMode.selected];
    }

    // AS3: _SafeCls_4054.as::furniSelectionTitle()
    override furniSelectionTitle(id: number): string
    {
        if(id === 0)
        {
            return 'wiredfurni.params.sources.furni.title.item_types';
        }

        return 'wiredfurni.params.sources.furni.title.chests';
    }

    // AS3: _SafeCls_4054.as::get forceHidePickFurniInstructions()
    override get forceHidePickFurniInstructions(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4054.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }
}
