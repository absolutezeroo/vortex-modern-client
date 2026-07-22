import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';
import type {IWindow} from '@core/window/IWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import type {DropdownParam} from '../params/DropdownParam';
import {ExpandableDropdown} from '../../common/advanced_dropdown/ExpandableDropdown';
import type {ExpandableDropdownOption} from '../../common/advanced_dropdown/ExpandableDropdownOption';
import {WiredUIPreset} from './WiredUIPreset';

/**
 * DropdownPreset — a dropdown widget: a drop MENU window (IDropMenuWindow) wrapped by an
 * ExpandableDropdown (which adds the advanced/"show more" behaviour). The caption is the collapsed
 * label; options come from the DropdownParam.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/DropdownPreset.as
 */
export class DropdownPreset extends WiredUIPreset
{
    // AS3: DropdownPreset.as::_container
    private _container: IDropMenuWindow;

    // AS3: DropdownPreset.as::_SafeStr_4593 (name derived: the expandable-dropdown driver)
    private _expandableDropdown: ExpandableDropdown;

    // AS3: DropdownPreset.as::DropdownPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, param: DropdownParam)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._container = wiredStyle.createDropdown();
        this._container.caption = param.caption;
        this._expandableDropdown = new ExpandableDropdown(this._container, param.showMoreLocalization, param.onChangeCallback);
        this._expandableDropdown.init(param.options == null ? [] : param.options, -1);
    }

    // AS3: DropdownPreset.as::get selectedId() — the int return coerces the ExpandableDropdown Number
    // (NaN when nothing is selected) via AS3 int(), so NaN becomes 0.
    get selectedId(): number
    {
        const id = this._expandableDropdown.selectedOptionId;

        return Number.isNaN(id) ? 0 : Math.trunc(id);
    }

    // AS3: DropdownPreset.as::set selectedId()
    set selectedId(id: number)
    {
        this._expandableDropdown.selectedOptionId = id;
    }

    // AS3: DropdownPreset.as::get selected()
    get selected(): ExpandableDropdownOption | null
    {
        return this._expandableDropdown.selectedOption;
    }

    // AS3: DropdownPreset.as::reinit()
    reinit(options: ExpandableDropdownOption[], selectedId: number): void
    {
        this._expandableDropdown.init(options, selectedId);
    }

    // AS3: DropdownPreset.as::reset()
    reset(): void
    {
        this.reinit([], -1);
    }

    // AS3: DropdownPreset.as::get dropdownOptions()
    get dropdownOptions(): ExpandableDropdownOption[]
    {
        return this._expandableDropdown.dropdownOptions;
    }

    // AS3: DropdownPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: DropdownPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._container.width = width;
    }

    // AS3: DropdownPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as IDropMenuWindow;
        this._expandableDropdown.dispose();
    }
}
