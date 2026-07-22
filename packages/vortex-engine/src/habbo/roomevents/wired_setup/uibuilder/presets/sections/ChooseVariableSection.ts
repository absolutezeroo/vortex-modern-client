import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import type {SharedVariableList} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredcontext/SharedVariableList';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {ISourceTypeListener} from '../../../inputsources/ISourceTypeListener';
import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import {SectionParam} from '../../params/SectionParam';
import {SourceTypeSelectorParam} from '../../params/SourceTypeSelectorParam';
import type {VariablePickerPreset} from '../VariablePickerPreset';
import {AbstractSectionPreset} from './AbstractSectionPreset';

/**
 * ChooseVariableSection — a titled section wrapping a VariablePickerPreset, optionally preceded by a
 * source-type selector. Used where an action/condition references a wired variable. When a merged-type
 * is set the source-type change routes to the controller's merged sources; otherwise it retargets the
 * picker.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/sections/ChooseVariableSection.as
 */
export class ChooseVariableSection extends AbstractSectionPreset implements ISourceTypeListener
{
    // AS3: ChooseVariableSection.as::_picker
    private _picker: VariablePickerPreset;

    // AS3: ChooseVariableSection.as::_SafeStr_8440 (name derived: the merged-source type, -1 if none)
    private _mergedType: number;

    // AS3: ChooseVariableSection.as::_SafeStr_5920 (name derived: the current variable target)
    private _target: number = 0;

    // AS3: ChooseVariableSection.as::ChooseVariableSection()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, mergedType: number, sourceTypes: number[] | null, filter: ((variable: WiredVariable) => boolean) | null, onSelect: ((variable: WiredVariable | null) => void) | null, title: string | null = null)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._mergedType = mergedType;

        let sectionParam: SectionParam | null = null;

        if(sourceTypes !== null)
        {
            sectionParam = new SectionParam(new SourceTypeSelectorParam(sourceTypes, this));
        }

        this._picker = presetManager.createVariablePicker(filter, onSelect);
        this.initializeSection(title === null ? this.l('variables.variable_selection') : title, this._picker, sectionParam);
    }

    // AS3: ChooseVariableSection.as::init()
    init(allVariables: SharedVariableList, selectedId: string, target: number): void
    {
        this._picker.init(allVariables, selectedId, target);
        this._target = target;
    }

    // AS3: ChooseVariableSection.as::onEditInitialized()
    onEditInitialized(): void
    {
        const selector = this._section.getSourceTypeSelector();

        if(selector !== null)
        {
            selector.select(this._target);
        }
    }

    // AS3: ChooseVariableSection.as::set target()
    set target(value: number)
    {
        this._target = value;
        this._picker.variableTarget = this._target;
    }

    // AS3: ChooseVariableSection.as::get target()
    get target(): number
    {
        return this._target;
    }

    // AS3: ChooseVariableSection.as::get finalizeSelection()
    get finalizeSelection(): string
    {
        return this._picker.finalizeSelection;
    }

    // AS3: ChooseVariableSection.as::get selected()
    get selected(): WiredVariable | null
    {
        return this._picker.selected;
    }

    // AS3: ChooseVariableSection.as::set sourceType()
    set sourceType(value: number)
    {
        if(this._mergedType !== -1)
        {
            this._roomEvents.wiredCtrl.setMergedSourceType(this._mergedType, value);
        }
        else
        {
            this.target = value;
        }
    }

    // AS3: ChooseVariableSection.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._picker = null as unknown as VariablePickerPreset;
    }
}
