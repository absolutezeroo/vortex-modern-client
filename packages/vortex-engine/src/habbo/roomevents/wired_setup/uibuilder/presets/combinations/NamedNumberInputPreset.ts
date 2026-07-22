import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IWindow} from '@core/window/IWindow';

import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import type {NumberInputParam} from '../../params/NumberInputParam';
import {TextParam} from '../../params/TextParam';
import type {NumberInputPreset} from '../NumberInputPreset';
import type {TextPreset} from '../TextPreset';
import {WiredUIPreset} from '../WiredUIPreset';

/**
 * NamedNumberInputPreset — a label followed by a number input, laid out horizontally.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/combinations/NamedNumberInputPreset.as
 */
export class NamedNumberInputPreset extends WiredUIPreset
{
    // AS3: NamedNumberInputPreset.as::_container
    private _container: IItemListWindow;

    // AS3: NamedNumberInputPreset.as::_SafeStr_4714 (name derived: the label text)
    private _text: TextPreset;

    // AS3: NamedNumberInputPreset.as::_SafeStr_5168 (name derived: the number input)
    private _input: NumberInputPreset;

    // AS3: NamedNumberInputPreset.as::NamedNumberInputPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, param: NumberInputParam, name: string, bold: boolean = false)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._container = presetManager.createLayout('horizontal_list_view') as unknown as IItemListWindow;
        this._text = presetManager.createText(name, new TextParam(0, bold));
        // AS3 assigns namedTextYOffset then immediately overwrites it with namedInputOffset (first is dead; preserved).
        this._text.window.y = wiredStyle.namedTextYOffset;
        this._input = presetManager.createNumberInput(param);
        this._text.window.y = wiredStyle.namedInputOffset;
        this._container.spacing = wiredStyle.genericHorizontalSpacing;
        this._container.addListItem(this._text.window);
        this._container.addListItem(this._input.window);
        this._container.height = Math.max(this._text.window.height, this._input.window.height);
    }

    // AS3: NamedNumberInputPreset.as::get value()
    get value(): number
    {
        return this._input.value;
    }

    // AS3: NamedNumberInputPreset.as::set value()
    set value(value: number)
    {
        this._input.value = value;
    }

    // AS3: NamedNumberInputPreset.as::reset()
    reset(): void
    {
        this._input.reset();
    }

    // AS3: NamedNumberInputPreset.as::set onValueChange()
    set onValueChange(callback: (value: number) => void)
    {
        this._input.onValueChange = callback;
    }

    // AS3: NamedNumberInputPreset.as::hasStaticWidth()
    override hasStaticWidth(): boolean
    {
        return this._input.hasStaticWidth();
    }

    // AS3: NamedNumberInputPreset.as::get staticWidth()
    override get staticWidth(): number
    {
        if(this.hasStaticWidth())
        {
            return this._container.width;
        }

        throw new Error('Named number input has no static width');
    }

    // AS3: NamedNumberInputPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: NamedNumberInputPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._text.resizeToWidth(this._text.width);
        this._input.resizeToWidth(width - this._input.window.x);
    }

    // AS3: NamedNumberInputPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [this._text, this._input];
    }

    // AS3: NamedNumberInputPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as IItemListWindow;
        this._text = null as unknown as TextPreset;
        this._input = null as unknown as NumberInputPreset;
    }
}
