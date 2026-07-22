import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IWindow} from '@core/window/IWindow';
import type {WindowEventListener} from '@core/window/events/WindowEventDispatcher';

import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import type {TextInputParam} from '../../params/TextInputParam';
import {TextParam} from '../../params/TextParam';
import type {TextInputPreset} from '../TextInputPreset';
import type {TextPreset} from '../TextPreset';
import {WiredUIPreset} from '../WiredUIPreset';

/**
 * NamedTextInputPreset — a label followed by a text input, laid out horizontally.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/combinations/NamedTextInputPreset.as
 */
export class NamedTextInputPreset extends WiredUIPreset
{
    // AS3: NamedTextInputPreset.as::_container
    private _container: IItemListWindow;

    // AS3: NamedTextInputPreset.as::_SafeStr_4714 (name derived: the label text)
    private _text: TextPreset;

    // AS3: NamedTextInputPreset.as::_SafeStr_5192 (name derived: the text input)
    private _input: TextInputPreset;

    // AS3: NamedTextInputPreset.as::NamedTextInputPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, param: TextInputParam, name: string, bold: boolean = false)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._container = presetManager.createLayout('horizontal_list_view') as unknown as IItemListWindow;
        this._text = presetManager.createText(name, new TextParam(0, bold));
        // AS3 assigns namedTextYOffset then immediately overwrites it with namedInputOffset (first is dead; preserved).
        this._text.window.y = wiredStyle.namedTextYOffset;
        this._input = presetManager.createTextInput(param);
        this._text.window.y = wiredStyle.namedInputOffset;
        this._container.spacing = wiredStyle.genericHorizontalSpacing;
        this._container.addListItem(this._text.window);
        this._container.addListItem(this._input.window);
        this._container.height = Math.max(this._text.window.height, this._input.window.height);
    }

    // AS3: NamedTextInputPreset.as::get text()
    get text(): string
    {
        return this._input.text;
    }

    // AS3: NamedTextInputPreset.as::set text()
    set text(value: string)
    {
        this._input.text = value;
    }

    // AS3: NamedTextInputPreset.as::addEventListener()
    addEventListener(type: string, listener: WindowEventListener): void
    {
        this._input.addEventListener(type, listener);
    }

    // AS3: NamedTextInputPreset.as::removeEventListener()
    removeEventListener(type: string, listener: WindowEventListener): void
    {
        this._input.removeEventListener(type, listener);
    }

    // AS3: NamedTextInputPreset.as::hasStaticWidth()
    override hasStaticWidth(): boolean
    {
        return this._input.hasStaticWidth();
    }

    // AS3: NamedTextInputPreset.as::get staticWidth()
    override get staticWidth(): number
    {
        if(this.hasStaticWidth())
        {
            return this._container.width;
        }

        throw new Error('Text input has no static width');
    }

    // AS3: NamedTextInputPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: NamedTextInputPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._text.resizeToWidth(this._text.width);
        this._input.resizeToWidth(width - this._input.window.x);
    }

    // AS3: NamedTextInputPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [this._text, this._input];
    }

    // AS3: NamedTextInputPreset.as::dispose()
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
        this._input = null as unknown as TextInputPreset;
    }
}
