import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import {RadioButtonParam} from '../../params/RadioButtonParam';
import {TextInputParam} from '../../params/TextInputParam';
import type {RadioButtonPreset} from '../RadioButtonPreset';
import type {RadioGroupPreset} from '../RadioGroupPreset';
import type {NamedTextInputPreset} from '../combinations/NamedTextInputPreset';
import {AbstractSectionPreset} from './AbstractSectionPreset';

/**
 * PlaceholderTypeSection — a titled radio group choosing whether a placeholder shows one value or
 * multiple values joined by a delimiter (with a named delimiter input on the second option).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/sections/PlaceholderTypeSection.as
 */
export class PlaceholderTypeSection extends AbstractSectionPreset
{
    // AS3: PlaceholderTypeSection.as::_SafeStr_5343 (name derived: the placeholder-type radio group)
    private _type: RadioGroupPreset;

    // AS3: PlaceholderTypeSection.as::_SafeStr_6935 (name derived: the delimiter input)
    private _delimiter: NamedTextInputPreset;

    // AS3: PlaceholderTypeSection.as::PlaceholderTypeSection()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, prefix: string | null = null)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._delimiter = presetManager.createNamedTextInput(new TextInputParam('', 5, null, 55), this.l('texts.select_delimiter'));
        const key = prefix == null ? '' : prefix + '.';
        this._type = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('texts.placeholder_type.' + key + '1')),
            new RadioButtonParam(1, this.l('texts.placeholder_type.' + key + '2'), null, this._delimiter)
        ]);
        this.initializeSection(this.l('texts.placeholder_type'), this._type);
    }

    // AS3: PlaceholderTypeSection.as::get isShowMultiple()
    get isShowMultiple(): boolean
    {
        return this._type.selected === 1;
    }

    // AS3: PlaceholderTypeSection.as::set isShowMultiple()
    set isShowMultiple(value: boolean)
    {
        this._type.selected = value ? 1 : 0;
    }

    // AS3: PlaceholderTypeSection.as::get delimiter()
    get delimiter(): string
    {
        return this.isShowMultiple ? this._delimiter.text : '';
    }

    // AS3: PlaceholderTypeSection.as::set delimiter()
    set delimiter(value: string)
    {
        this._delimiter.text = value;
    }

    // AS3: PlaceholderTypeSection.as::_SafeStr_4547() (name derived: fetch the radio option by index)
    radioAt(index: number): RadioButtonPreset
    {
        return this._type.radioAt(index);
    }

    // AS3: PlaceholderTypeSection.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._type = null as unknown as RadioGroupPreset;
        this._delimiter = null as unknown as NamedTextInputPreset;
    }
}
