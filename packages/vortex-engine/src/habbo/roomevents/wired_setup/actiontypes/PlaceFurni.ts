import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {WiredVariableHolderType} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariableHolderType';
import {WiredVariableType} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariableType';

import {DefaultElement} from '../DefaultElement';
import {VariableExtraSourceTypes} from '../common/VariableExtraSourceTypes';
import {WiredInputSourcePicker} from '../inputsources/WiredInputSourcePicker';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {CheckboxOptionParam} from '../uibuilder/params/CheckboxOptionParam';
import {NumberInputParam} from '../uibuilder/params/NumberInputParam';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import {SectionParam} from '../uibuilder/params/SectionParam';
import {TextParam} from '../uibuilder/params/TextParam';
import type {CheckboxGroupPreset} from '../uibuilder/presets/CheckboxGroupPreset';
import type {NumberInputPreset} from '../uibuilder/presets/NumberInputPreset';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {SectionPreset} from '../uibuilder/presets/SectionPreset';
import type {ChooseVariableSection} from '../uibuilder/presets/sections/ChooseVariableSection';
import type {ValueOrVariableSection} from '../uibuilder/presets/sections/ValueOrVariableSection';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * PlaceFurni — the "place a furni" wired action (a state-snapshot action): choose the target location
 * (source vs custom) and altitude (on-top/source/custom), optional x/y/altitude offsets, and optionally
 * spawn the furni carrying a furni variable (a choose-variable section + a value-or-variable value). The
 * flags/offsets/spawn-value go to intParams; the spawn variable and reference-value variable to
 * variableIds[0]/[1]; the target-location and reference-value sources are merged-source pickers.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4065`; the name follows the code it returns
 * (ActionTypeCodes.PLACE_FURNI).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4065.as
 */
export class PlaceFurni extends DefaultActionType
{
    // AS3: _SafeCls_4065.as::TARGET_LOCATION_SOURCE
    private static readonly TARGET_LOCATION_SOURCE: number = 0;

    // AS3: _SafeCls_4065.as::TARGET_LOCATION_CUSTOM
    private static readonly TARGET_LOCATION_CUSTOM: number = 1;

    // AS3: _SafeCls_4065.as::TARGET_ALTITUDE_ON_TOP
    private static readonly TARGET_ALTITUDE_ON_TOP: number = 0;

    // AS3: _SafeCls_4065.as::TARGET_ALTITUDE_CUSTOM (TARGET_ALTITUDE_SOURCE=1 is declared but unused in AS3)
    private static readonly TARGET_ALTITUDE_CUSTOM: number = 2;

    // AS3: _SafeCls_4065.as::OFFSET_MIN
    private static readonly OFFSET_MIN: number = -64;

    // AS3: _SafeCls_4065.as::_SafeStr_10747 (name derived: the offset max)
    private static readonly OFFSET_MAX: number = 64;

    // AS3: _SafeCls_4065.as::_SafeStr_6699 (name derived: the target-location radio)
    private _targetLocationRadio!: RadioGroupPreset;

    // AS3: _SafeCls_4065.as::_SafeStr_6861 (name derived: the target-altitude radio)
    private _targetAltitudeRadio!: RadioGroupPreset;

    // AS3: _SafeCls_4065.as::_offsetCheckboxes
    private _offsetCheckboxes!: CheckboxGroupPreset;

    // AS3: _SafeCls_4065.as::_SafeStr_7606 (name derived: the x-offset input)
    private _offsetX!: NumberInputPreset;

    // AS3: _SafeCls_4065.as::_SafeStr_7548 (name derived: the y-offset input)
    private _offsetY!: NumberInputPreset;

    // AS3: _SafeCls_4065.as::_SafeStr_7765 (name derived: the altitude-offset input)
    private _offsetAltitude!: NumberInputPreset;

    // AS3: _SafeCls_4065.as::_SafeStr_5735 (name derived: the "spawn with variable" checkbox group)
    private _spawnWithVariable!: CheckboxGroupPreset;

    // AS3: _SafeCls_4065.as::_SafeStr_8756 (name derived: the spawn-with-variable section)
    private _spawnSection!: SectionPreset;

    // AS3: _SafeCls_4065.as::_SafeStr_6562 (name derived: the spawn-variable choose section)
    private _spawnVariable!: ChooseVariableSection;

    // AS3: _SafeCls_4065.as::_SafeStr_4937 (name derived: the spawn value-or-variable section)
    private _spawnValue!: ValueOrVariableSection;

    // AS3: _SafeCls_4065.as::_SafeStr_7500 (name derived: whether the target source is the user)
    private _isUserSource: boolean = false;

    // AS3: _SafeCls_4065.as::filterSpawnVariable()
    private static filterSpawnVariable(variable: WiredVariable): boolean
    {
        return variable.variableTarget === WiredVariableHolderType.FURNI && variable.canCreateAndDelete && variable.variableType === WiredVariableType.STANDARD;
    }

    // AS3: _SafeCls_4065.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.PLACE_FURNI;
    }

    // AS3: _SafeCls_4065.as::get hasStateSnapshot()
    override get hasStateSnapshot(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4065.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4065.as::buildInputs()
    override buildInputs(presetManager: PresetManager, wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const usageInfo = presetManager.createUsageInfoSection('${wiredfurni.params.place_furni.usage_info}');

        const infoTextParam = new TextParam(1);
        infoTextParam.textColor = wiredStyle.softTextColor;

        this._targetLocationRadio = presetManager.createRadioGroup([new RadioButtonParam(0, '${wiredfurni.params.place_furni.target_location.0}', null, presetManager.createText('${wiredfurni.params.place_furni.target_location.0.info}', infoTextParam)), new RadioButtonParam(1, '${wiredfurni.params.place_furni.target_location.1}')], (option) => this.onTargetLocationChange(option));
        this._targetLocationRadio.selected = PlaceFurni.TARGET_LOCATION_SOURCE;
        const locationSection = presetManager.createSection('${wiredfurni.params.place_furni.target_location}', this._targetLocationRadio, SectionParam.HIDDEN);

        this._targetAltitudeRadio = presetManager.createRadioGroup([new RadioButtonParam(0, '${wiredfurni.params.place_furni.target_altitude.0}'), new RadioButtonParam(1, '${wiredfurni.params.place_furni.target_altitude.1}'), new RadioButtonParam(2, '${wiredfurni.params.place_furni.target_altitude.2}')], (option) => this.onTargetAltitudeChange(option));
        this._targetAltitudeRadio.selected = PlaceFurni.TARGET_ALTITUDE_ON_TOP;
        const altitudeSection = presetManager.createSection('${wiredfurni.params.place_furni.target_altitude}', this._targetAltitudeRadio, SectionParam.HIDDEN);

        this._offsetX = presetManager.createNumberInput(new NumberInputParam(0, PlaceFurni.OFFSET_MIN, PlaceFurni.OFFSET_MAX));
        this._offsetY = presetManager.createNumberInput(new NumberInputParam(0, PlaceFurni.OFFSET_MIN, PlaceFurni.OFFSET_MAX));
        this._offsetAltitude = presetManager.createNumberInput(new NumberInputParam(0, -8000, 8000));
        const offsetParams = [new CheckboxOptionParam('${wiredfurni.params.place_furni.offsets.x}', 0, this._offsetX), new CheckboxOptionParam('${wiredfurni.params.place_furni.offsets.y}', 1, this._offsetY), new CheckboxOptionParam('${wiredfurni.params.place_furni.offsets.altitude}', 2, this._offsetAltitude)];
        this._offsetCheckboxes = presetManager.createCheckboxGroup(offsetParams);
        const offsetSection = presetManager.createSection('${wiredfurni.params.place_furni.offsets}', this._offsetCheckboxes, SectionParam.COLLAPSED);

        this._spawnVariable = presetManager.createChooseVariableSection(-1, null, PlaceFurni.filterSpawnVariable, (option) => this.onSpawnVariableSelected(option));
        this._spawnValue = presetManager.createValueOrVariableSection(1, this.mergedSourceOptions(1), '${wiredfurni.params.place_furni.spawn_with_value}', -2147483648, 2147483647);
        const spawnList = presetManager.createSimpleListView(true, [this._spawnVariable, this._spawnValue]);
        this._spawnWithVariable = presetManager.createCheckboxGroup([new CheckboxOptionParam('${wiredfurni.params.place_furni.spawn_with_variable}', 0, null, spawnList)], (id, selected) => this.onSpawnWithVariableChanged(id, selected));
        this._spawnSection = presetManager.createSection('${wiredfurni.params.place_furni.spawn_with_variable}', this._spawnWithVariable, SectionParam.COLLAPSED);

        builder.addElements(usageInfo, locationSection, altitudeSection, offsetSection, this._spawnSection);
        this.updateCustomReferenceSourceState();
        this.updateSpawnValueState();
    }

    // AS3: _SafeCls_4065.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._isUserSource = def.getBoolean(0);
        this._targetLocationRadio.selected = def.getInt(1);
        this._targetAltitudeRadio.selected = def.getInt(2);
        this.updateOffsetField(this._offsetX, this._offsetCheckboxes, 0, def.getInt(3));
        this.updateOffsetField(this._offsetY, this._offsetCheckboxes, 1, def.getInt(4));
        this.updateOffsetField(this._offsetAltitude, this._offsetCheckboxes, 2, def.getInt(5));

        const option = def.getInt(7);
        const value = def.getInt(8);
        const referenceTarget = def.getInt(9);
        const spawnVariableId = def.variableIds.length > 0 ? def.variableIds[0] : WiredVariable.DEFAULT_VARIABLE_ID;
        const spawnValueVariableId = def.variableIds.length > 1 ? def.variableIds[1] : WiredVariable.DEFAULT_VARIABLE_ID;

        this._spawnVariable.init(def.wiredContext.roomVariablesList, spawnVariableId, WiredVariableHolderType.FURNI);
        this._spawnValue.init(def.wiredContext.roomVariablesList, spawnValueVariableId, referenceTarget, option, value);
        this._spawnWithVariable.optionById(0).selected = def.getBoolean(6);
        this.updateCustomReferenceSourceState();
        this.updateSpawnValueState();
        this._spawnSection.updateDisabledState();
    }

    // AS3: _SafeCls_4065.as::onEditInitialized()
    override onEditInitialized(): void
    {
        this._spawnVariable.onEditInitialized();
        this._spawnValue.onEditInitialized();
    }

    // AS3: _SafeCls_4065.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const useValue = this._spawnWithVariable.optionById(0).selected && !this._spawnValue.disabled;
        const option = useValue ? this._spawnValue.option : 0;
        const value = useValue ? this._spawnValue.numberValue : 0;

        return [this._isUserSource ? 1 : 0, this._targetLocationRadio.selected, this._targetAltitudeRadio.selected, this.readOffsetValue(0, this._offsetX), this.readOffsetValue(1, this._offsetY), this.readOffsetValue(2, this._offsetAltitude), this._spawnWithVariable.optionById(0).selected ? 1 : 0, option, value, this._spawnValue.target];
    }

    // AS3: _SafeCls_4065.as::readVariableIdsFromForm()
    override readVariableIdsFromForm(): string[]
    {
        const spawnVariableId = this._spawnWithVariable.optionById(0).selected ? this._spawnVariable.finalizeSelection : WiredVariable.DEFAULT_VARIABLE_ID;
        const useValue = this._spawnWithVariable.optionById(0).selected && !this._spawnValue.disabled;
        const spawnValueVariableId = useValue && this._spawnValue.option === 1 ? this._spawnValue.finalizeSelection : WiredVariable.DEFAULT_VARIABLE_ID;

        return [spawnVariableId, spawnValueVariableId];
    }

    // AS3: _SafeCls_4065.as::mergedSelections()
    override mergedSelections(): number[][]
    {
        return [[1, 0], [2, 1]];
    }

    // AS3: _SafeCls_4065.as::setMergedType()
    override setMergedType(a: number, b: number): void
    {
        if(a === 0)
        {
            this._isUserSource = b === WiredInputSourcePicker.USER_SOURCE;
        }
        else if(a === 1)
        {
            this._spawnValue.target = b;
        }
    }

    // AS3: _SafeCls_4065.as::getMergedType()
    override getMergedType(id: number): number
    {
        if(id === 0)
        {
            return this._isUserSource ? WiredInputSourcePicker.USER_SOURCE : WiredInputSourcePicker.FURNI_SOURCE;
        }

        return this._spawnValue.target;
    }

    // AS3: _SafeCls_4065.as::isInputSourceDisabled()
    override isInputSourceDisabled(a: number, b: number): boolean
    {
        if(b !== WiredInputSourcePicker.MERGED_SOURCE)
        {
            return false;
        }

        if(a === 0)
        {
            return !this.requiresCustomReferenceSource();
        }

        return this._spawnValue.isSourcePickingDisabled() || !this._spawnWithVariable.optionById(0).selected || this._spawnValue.disabled;
    }

    // AS3: _SafeCls_4065.as::hasCustomTypePicker()
    override hasCustomTypePicker(id: number): boolean
    {
        return id === 1;
    }

    // AS3: _SafeCls_4065.as::getCustomSourcesForMergedType()
    override getCustomSourcesForMergedType(id: number): number[]
    {
        if(id === 1)
        {
            return [VariableExtraSourceTypes.GLOBAL_SOURCE, VariableExtraSourceTypes.CONTEXT_SOURCE];
        }

        return [];
    }

    // AS3: _SafeCls_4065.as::onTargetLocationChange() — the radio id arg is unused (AS3 ignores it).
    private onTargetLocationChange(_id: number): void
    {
        this.updateCustomReferenceSourceState();
    }

    // AS3: _SafeCls_4065.as::onTargetAltitudeChange() — the radio id arg is unused (AS3 ignores it).
    private onTargetAltitudeChange(_id: number): void
    {
        this.updateCustomReferenceSourceState();
    }

    // AS3: _SafeCls_4065.as::onSpawnWithVariableChanged()
    private onSpawnWithVariableChanged(id: number, _selected: boolean): void
    {
        if(id !== 0)
        {
            return;
        }

        this.updateSpawnValueState();
    }

    // AS3: _SafeCls_4065.as::onSpawnVariableSelected() — the variable arg is unused (AS3 ignores it).
    private onSpawnVariableSelected(_variable: WiredVariable | null): void
    {
        this.updateSpawnValueState();
    }

    // AS3: _SafeCls_4065.as::updateCustomReferenceSourceState()
    private updateCustomReferenceSourceState(): void
    {
        this.roomEvents.wiredCtrl.updateSourceContainer(WiredInputSourcePicker.MERGED_SOURCE, 0);
    }

    // AS3: _SafeCls_4065.as::updateSpawnValueState()
    private updateSpawnValueState(): void
    {
        const variable = this._spawnVariable.selected;
        const hasValue = variable !== null && variable.hasValue;
        const spawnEnabled = this._spawnWithVariable.optionById(0).selected;
        this._spawnValue.disabled = !spawnEnabled || !hasValue;
        this.roomEvents.wiredCtrl.updateSourceContainer(WiredInputSourcePicker.MERGED_SOURCE, 1);
    }

    // AS3: _SafeCls_4065.as::requiresCustomReferenceSource()
    private requiresCustomReferenceSource(): boolean
    {
        return this._targetLocationRadio.selected === PlaceFurni.TARGET_LOCATION_CUSTOM || this._targetAltitudeRadio.selected === PlaceFurni.TARGET_ALTITUDE_CUSTOM;
    }

    // AS3: _SafeCls_4065.as::readOffsetValue()
    private readOffsetValue(index: number, input: NumberInputPreset): number
    {
        return this._offsetCheckboxes.optionById(index).selected ? input.value : 0;
    }

    // AS3: _SafeCls_4065.as::updateOffsetField()
    private updateOffsetField(input: NumberInputPreset, group: CheckboxGroupPreset, index: number, value: number): void
    {
        input.value = value;
        group.optionById(index).selected = value !== 0;
    }

    // AS3: _SafeCls_4065.as::get widthModifier()
    override get widthModifier(): number
    {
        return 1.2;
    }

    // AS3: _SafeCls_4065.as::furniSelectionTitle()
    override furniSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.furni.title.place_furni';
    }

    // AS3: _SafeCls_4065.as::mergedSelectionTitle()
    override mergedSelectionTitle(id: number): string
    {
        if(id === 0)
        {
            return 'wiredfurni.params.sources.merged.title.custom_target';
        }

        return 'wiredfurni.params.sources.merged.title.variables_reference';
    }

    // AS3: _SafeCls_4065.as::get forceHidePickFurniInstructions()
    override get forceHidePickFurniInstructions(): boolean
    {
        return true;
    }
}
