import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import type {SharedGlobalPlaceholderList} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredcontext/SharedGlobalPlaceholderList';

import {DefaultElement} from '../DefaultElement';
import {ExpandableDropdownOption} from '../common/advanced_dropdown/ExpandableDropdownOption';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {DropdownParam} from '../uibuilder/params/DropdownParam';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import {TextInputParam} from '../uibuilder/params/TextInputParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {TextInputPreset} from '../uibuilder/presets/TextInputPreset';
import type {NamedDropdownPreset} from '../uibuilder/presets/combinations/NamedDropdownPreset';
import type {PlaceholderNameSection} from '../uibuilder/presets/sections/PlaceholderNameSection';
import {AddonCodes} from './AddonCodes';
import {DefaultAddonType} from './DefaultAddonType';

/**
 * GlobalPlaceholderAddon — the "global placeholder" wired addon: names a placeholder and gives it a
 * value that is either a literal (a text input) or a reference to a placeholder shared from another
 * room (a room dropdown + a placeholder dropdown, sourced from wiredContext.referencePlaceholderList),
 * chosen by a radio group. intParams carry [type, 0, roomId]; stringParam is "name\tvalue".
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/GlobalPlaceholderAddon.as
 */
export class GlobalPlaceholderAddon extends DefaultAddonType
{
    // AS3: GlobalPlaceholderAddon.as::_SafeStr_6038 (name derived: the placeholder-name section)
    private _placeholderName!: PlaceholderNameSection;

    // AS3: GlobalPlaceholderAddon.as::_SafeStr_6107 (name derived: the value-source radio group)
    private _typeRadio!: RadioGroupPreset;

    // AS3: GlobalPlaceholderAddon.as::_SafeStr_7188 (name derived: the literal-value input)
    private _valueInput!: TextInputPreset;

    // AS3: GlobalPlaceholderAddon.as::_roomDropdown
    private _roomDropdown!: NamedDropdownPreset;

    // AS3: GlobalPlaceholderAddon.as::_placeholderDropdown
    private _placeholderDropdown!: NamedDropdownPreset;

    // AS3: GlobalPlaceholderAddon.as::_SafeStr_6108 (name derived: the shared placeholders list)
    private _placeholders: SharedGlobalPlaceholderList | null = null;

    // AS3: GlobalPlaceholderAddon.as::_SafeStr_6422 (name derived: the last auto-filled placeholder name)
    private _lastPlaceholderName: string | null = null;

    // AS3: GlobalPlaceholderAddon.as::get code()
    override get code(): number
    {
        return AddonCodes.GLOBAL_PLACEHOLDER;
    }

    // AS3: GlobalPlaceholderAddon.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: GlobalPlaceholderAddon.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._placeholderName = presetManager.createPlaceholderNameSection(this.l('texts.placeholder_name'), '$');
        this._valueInput = presetManager.createTextInput(new TextInputParam('', 100));
        this._roomDropdown = presetManager.createNamedDropdown(new DropdownParam(this.l('room_selection.tooltip'), null, (option) => this.initPlaceholdersForRoom(option as ExpandableDropdownOption | null)), this.l('room_selection'));
        this._placeholderDropdown = presetManager.createNamedDropdown(new DropdownParam(this.l('placeholder_selection.tooltip'), null, (option) => this.onPlaceholderSelected(option as ExpandableDropdownOption | null)), this.l('placeholder_selection'));
        this._typeRadio = presetManager.createRadioGroup([new RadioButtonParam(0, this.l('from_value'), null, this._valueInput), new RadioButtonParam(1, this.l('from_another_room'), null, presetManager.createSimpleListView(true, [this._roomDropdown, this._placeholderDropdown]))]);
        const section = presetManager.createSection(this.l('choose_type'), this._typeRadio);
        builder.addElements(this._placeholderName, section);
    }

    // AS3: GlobalPlaceholderAddon.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._lastPlaceholderName = null;

        const type = def.getInt(0);
        const placeholderName = def.getString(0);

        this._placeholderName.placeholderName = placeholderName;
        this._placeholders = def.wiredContext.referencePlaceholderList;
        this._typeRadio.setOptionDisabled(1, this._placeholders === null);
        this._typeRadio.setOptionDisabled(0, this._placeholders === null && type === 1);
        this._typeRadio.selected = type;
        this._roomDropdown.reset();
        this._placeholderDropdown.reset();

        if(type === 0)
        {
            this._valueInput.text = def.getString(1);

            if(this._placeholders !== null)
            {
                this._roomDropdown.reinit(this.findRooms(), -1);
            }
        }
        else
        {
            this._valueInput.text = '';

            const placeholderRef = def.getString(1);
            const roomIndex = def.getInt(2);

            this._roomDropdown.reinit(this.findRooms(), roomIndex);
            this.initPlaceholdersForRoom(this._roomDropdown.selected, placeholderRef);
            this._lastPlaceholderName = this._placeholderDropdown.selected?.displayString ?? null;
        }
    }

    // AS3: GlobalPlaceholderAddon.as::initPlaceholdersForRoom()
    private initPlaceholdersForRoom(option: ExpandableDropdownOption | null, placeholderName: string | null = null): void
    {
        if(option === null)
        {
            this._placeholderDropdown.reset();
            return;
        }

        const options: ExpandableDropdownOption[] = [];
        let selectedIndex = -1;

        if(this._placeholders !== null)
        {
            for(const placeholder of this._placeholders.sharedPlaceholders)
            {
                if(placeholder.roomId === option.id)
                {
                    if(placeholderName !== null && placeholder.placeholderName === placeholderName)
                    {
                        selectedIndex = options.length;
                    }

                    options.push(new ExpandableDropdownOption(options.length, placeholder.placeholderName));
                }
            }
        }

        this._placeholderDropdown.reinit(options, selectedIndex);
    }

    // AS3: GlobalPlaceholderAddon.as::onPlaceholderSelected()
    private onPlaceholderSelected(option: ExpandableDropdownOption | null): void
    {
        if(this._placeholderName.placeholderName.length === 0 || (this._lastPlaceholderName !== null && this._lastPlaceholderName === this._placeholderName.placeholderName))
        {
            this._placeholderName.placeholderName = option !== null ? option.displayString : '';
        }

        this._lastPlaceholderName = this._placeholderDropdown.selected?.displayString ?? null;
    }

    // AS3: GlobalPlaceholderAddon.as::findRooms()
    private findRooms(): ExpandableDropdownOption[]
    {
        const seen = new Set<number>();
        const result: ExpandableDropdownOption[] = [];

        if(this._placeholders !== null)
        {
            for(const placeholder of this._placeholders.sharedPlaceholders)
            {
                if(!seen.has(placeholder.roomId))
                {
                    result.push(new ExpandableDropdownOption(placeholder.roomId, placeholder.roomName));
                }

                seen.add(placeholder.roomId);
            }
        }

        // AS3 sorts with a comparator typed (param1:String, param2:String) but receiving
        // ExpandableDropdownOption elements — AS3 coerces each to String (all identical), so the
        // comparator always returns 0 and the sort is a no-op. Preserved (rooms stay in insertion order).
        result.sort(() => 0);

        return result;
    }

    // AS3: GlobalPlaceholderAddon.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._typeRadio.selected, 0, this._typeRadio.selected === 0 ? 0 : this._roomDropdown.selectedId];
    }

    // AS3: GlobalPlaceholderAddon.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        let result = this._placeholderName.placeholderName + '\t';

        if(this._typeRadio.selected === 0)
        {
            result += this._valueInput.text;
        }
        else if(this._placeholderDropdown.selected !== null)
        {
            result += this._placeholderDropdown.selected.displayString;
        }

        return result;
    }
}
