import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import type {SharedVariableList} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredcontext/SharedVariableList';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import {WiredInputSourcePicker} from '../../../inputsources/WiredInputSourcePicker';
import type {ISourceTypeListener} from '../../../inputsources/ISourceTypeListener';
import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import {NumberInputParam} from '../../params/NumberInputParam';
import {RadioButtonParam} from '../../params/RadioButtonParam';
import {SourceTypeSelectorParam} from '../../params/SourceTypeSelectorParam';
import type {NumberInputPreset} from '../NumberInputPreset';
import type {RadioGroupPreset} from '../RadioGroupPreset';
import type {SourceTypeSelectorPreset} from '../SourceTypeSelectorPreset';
import type {VariablePickerPreset} from '../VariablePickerPreset';
import {AbstractSectionPreset} from './AbstractSectionPreset';

/**
 * ValueOrVariableSection — a titled section offering a value either as a literal number (a number
 * input) or as a reference to a wired variable (a source-type selector + variable picker), chosen by a
 * radio group. Only variables with a value are pickable. Changing the radio option updates the
 * controller's merged source container.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/sections/ValueOrVariableSection.as
 */
export class ValueOrVariableSection extends AbstractSectionPreset implements ISourceTypeListener
{
    // AS3: ValueOrVariableSection.as::_SafeStr_6249 (name derived: the value/variable radio group)
    private _radio: RadioGroupPreset;

    // AS3: ValueOrVariableSection.as::_SafeStr_5808 (name derived: the literal-value number input)
    private _numberInput: NumberInputPreset;

    // AS3: ValueOrVariableSection.as::_picker
    private _picker: VariablePickerPreset;

    // AS3: ValueOrVariableSection.as::_SafeStr_7151 (name derived: the source-type selector)
    private _sourceTypeSelector: SourceTypeSelectorPreset;

    // AS3: ValueOrVariableSection.as::_SafeStr_8440 (name derived: the merged-source type)
    private _mergedType: number;

    // AS3: ValueOrVariableSection.as::_SafeStr_5920 (name derived: the current variable target)
    private _target: number = 0;

    // AS3: ValueOrVariableSection.as::ValueOrVariableSection()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, mergedType: number, sourceTypes: number[], title: string, min: number, max: number)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._mergedType = mergedType;
        this._numberInput = presetManager.createNumberInput(new NumberInputParam(0, min, max, 45, 0, false, true));
        this._sourceTypeSelector = presetManager.createSourceTypeSelector(new SourceTypeSelectorParam(sourceTypes, this));
        this._picker = presetManager.createVariablePicker(ValueOrVariableSection.variableSelectionFilter);
        this._radio = presetManager.createRadioGroup([new RadioButtonParam(0, this.l('variables.reference_value.set_value'), this._numberInput), new RadioButtonParam(1, this.l('variables.reference_value.from_variable'), this._sourceTypeSelector.alignRight(), this._picker)], (option) => this.onChangeRadioOption(option));
        this.initializeSection(title, this._radio);
    }

    // AS3: ValueOrVariableSection.as::variableSelectionFilter() — only variables that carry a value.
    private static variableSelectionFilter(variable: WiredVariable): boolean
    {
        return variable.hasValue;
    }

    // AS3: ValueOrVariableSection.as::init()
    init(allVariables: SharedVariableList, selectedId: string, target: number, option: number, value: number): void
    {
        this._picker.init(allVariables, selectedId, target);
        this._target = target;
        this._radio.selected = option;
        this._numberInput.value = value;
    }

    // AS3: ValueOrVariableSection.as::onEditInitialized()
    onEditInitialized(): void
    {
        this._sourceTypeSelector.select(this._target);
    }

    // AS3: ValueOrVariableSection.as::set target()
    set target(value: number)
    {
        this._target = value;
        this._picker.variableTarget = this._target;
    }

    // AS3: ValueOrVariableSection.as::get target()
    get target(): number
    {
        return this._target;
    }

    // AS3: ValueOrVariableSection.as::get option()
    get option(): number
    {
        return this._radio.selected;
    }

    // AS3: ValueOrVariableSection.as::get numberValue()
    get numberValue(): number
    {
        return this._numberInput.value;
    }

    // AS3: ValueOrVariableSection.as::get finalizeSelection()
    get finalizeSelection(): string
    {
        return this._picker.finalizeSelection;
    }

    // AS3: ValueOrVariableSection.as::onChangeRadioOption() — the option arg is unused (AS3 ignores it).
    private onChangeRadioOption(_option: number): void
    {
        this._roomEvents.wiredCtrl.updateSourceContainer(WiredInputSourcePicker.MERGED_SOURCE, this._mergedType);
    }

    // AS3: ValueOrVariableSection.as::isSourcePickingDisabled()
    isSourcePickingDisabled(): boolean
    {
        return this._radio.selected === 0;
    }

    // AS3: ValueOrVariableSection.as::set sourceType()
    set sourceType(value: number)
    {
        this._roomEvents.wiredCtrl.setMergedSourceType(this._mergedType, value);
    }

    // AS3: ValueOrVariableSection.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._radio = null as unknown as RadioGroupPreset;
        this._numberInput = null as unknown as NumberInputPreset;
        this._picker = null as unknown as VariablePickerPreset;
        this._sourceTypeSelector = null as unknown as SourceTypeSelectorPreset;
    }
}
