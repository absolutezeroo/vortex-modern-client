import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import {TextParam} from '../params/TextParam';
import {WiredUIPreset} from './WiredUIPreset';
import type {TextPreset} from './TextPreset';

/**
 * TextualButtonPreset — an underlined text label wrapped in a clickable growing container (a text
 * link). Fires the callback on click; the whole row is the hit target (mouseThreshold 0).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/TextualButtonPreset.as
 */
export class TextualButtonPreset extends WiredUIPreset
{
    // AS3: TextualButtonPreset.as::_container
    private _container: IWindowContainer;

    // AS3: TextualButtonPreset.as::_text (label preset)
    private _text: TextPreset;

    // AS3: TextualButtonPreset.as::_onClick (click callback)
    private _onClick: () => void;

    // AS3: TextualButtonPreset.as::TextualButtonPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, caption: string, onClick: () => void)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._onClick = onClick;
        this._container = presetManager.createLayout('growing_container_view') as unknown as IWindowContainer;
        this._text = presetManager.createText(caption, new TextParam(0, false, 0, true));
        this._container.addChild(this._text.window);
        this._container.addEventListener('WME_CLICK', this._clicked);
        this._container.mouseThreshold = 0;
    }

    // AS3: TextualButtonPreset.as::set text()
    set text(value: string)
    {
        this._text.text = value;
    }

    // AS3: TextualButtonPreset.as::onClick()
    private _clicked = (_event: WindowMouseEvent): void =>
    {
        this._onClick();
    };

    // AS3: TextualButtonPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: TextualButtonPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._container.width = width;
    }

    // AS3: TextualButtonPreset.as::hasStaticWidth()
    override hasStaticWidth(): boolean
    {
        return true;
    }

    // AS3: TextualButtonPreset.as::get staticWidth()
    override get staticWidth(): number
    {
        return this._container.width;
    }

    // AS3: TextualButtonPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [this._text];
    }

    // AS3: TextualButtonPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as IWindowContainer;
        this._text = null as unknown as TextPreset;
        this._onClick = null as unknown as () => void;
    }
}
