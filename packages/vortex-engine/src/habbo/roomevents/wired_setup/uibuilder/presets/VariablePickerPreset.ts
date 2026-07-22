import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import type {SharedVariableList} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredcontext/SharedVariableList';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import {NewVariablePicker} from './newvariablepicker/NewVariablePicker';
import {WiredUIPreset} from './WiredUIPreset';

/**
 * VariablePickerPreset — the WiredUIPreset wrapper around a NewVariablePicker widget (built from the
 * "search_tree_dropdown" layout). Exposes init / variableTarget / selected and finalizeSelection (which
 * commits the current pick to the picker's history and returns its variable id).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/VariablePickerPreset.as
 */
export class VariablePickerPreset extends WiredUIPreset
{
    // AS3: VariablePickerPreset.as::_picker
    private _picker: NewVariablePicker;

    // AS3: VariablePickerPreset.as::VariablePickerPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, variableFilter: ((variable: WiredVariable) => boolean) | null = null, onSelect: ((variable: WiredVariable | null) => void) | null = null)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._picker = new NewVariablePicker(roomEvents, presetManager.createLayout('search_tree_dropdown') as unknown as IWindowContainer, variableFilter, onSelect, wiredStyle);
    }

    // AS3: VariablePickerPreset.as::init()
    init(allVariables: SharedVariableList, selectedId: string, target: number): void
    {
        this._picker.init(allVariables, selectedId, target);
    }

    // AS3: VariablePickerPreset.as::set variableTarget()
    set variableTarget(target: number)
    {
        this._picker.variableTarget = target;
    }

    // AS3: VariablePickerPreset.as::get selected()
    get selected(): WiredVariable | null
    {
        return this._picker.selected;
    }

    // AS3: VariablePickerPreset.as::get finalizeSelection() — commits the pick to history and returns its
    // id (AS3 `selected?.variableId` yields null when nothing is selected; empty string here).
    get finalizeSelection(): string
    {
        const selected = this.selected;
        this._picker.finalize();
        return selected !== null ? selected.variableId : '';
    }

    // AS3: VariablePickerPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._picker.width = width;
    }

    // AS3: VariablePickerPreset.as::get window()
    override get window(): IWindow
    {
        return this._picker.window;
    }

    // AS3: VariablePickerPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._picker.dispose();
        this._picker = null as unknown as NewVariablePicker;
    }
}
