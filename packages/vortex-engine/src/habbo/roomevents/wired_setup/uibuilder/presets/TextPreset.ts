import type {IWindow} from '@core/window/IWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import type {TextParam} from '../params/TextParam';
import {WiredUIPreset} from './WiredUIPreset';

/**
 * TextPreset — a text label. Applies the style's text view with the TextParam's font/colour/underline,
 * and one of three layout modes: stretch (default, single line that fills the width), multiline
 * (word-wrapped up to maxLines with optional alignment), or overflow (single line ellipsised to "…").
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/TextPreset.as
 */
export class TextPreset extends WiredUIPreset
{
    // AS3: TextPreset.as::_param
    private _param: TextParam;

    // AS3: TextPreset.as::_window
    protected _window: ITextWindow;

    // AS3: TextPreset.as::TextPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, text: string, param: TextParam)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._param = param;
        this._window = this.createView();

        if(this._param.fontSize !== -1)
        {
            this._window.fontSize = this._param.fontSize;
        }

        if(this._param.textColor !== 0)
        {
            this._window.textColor = this._param.textColor;
        }

        this._window.text = text;
        this.initializeMode(param);
    }

    // AS3: TextPreset.as::initializeMode()
    protected initializeMode(param: TextParam): void
    {
        if(param.mode === 1)
        {
            this._window.multiline = true;
            this._window.wordWrap = true;
            this._window.maxLines = param.maxLines;

            if(param.alignment != null)
            {
                this._window.autoSize = param.alignment;
            }
        }

        if(param.mode === 2)
        {
            this._window.overflowReplace = '...';
            this._window.autoSize = 'none';
        }
    }

    // AS3: TextPreset.as::createView()
    protected createView(): ITextWindow
    {
        const view = this._wiredStyle.createTextView(this._param.bold);

        view.underline = this._param.underline;

        return view;
    }

    // AS3: TextPreset.as::get text()
    get text(): string
    {
        return this._window.text;
    }

    // AS3: TextPreset.as::set text()
    set text(value: string)
    {
        this._window.text = value;
    }

    // AS3: TextPreset.as::hasStaticWidth()
    override hasStaticWidth(): boolean
    {
        return this.canStretch;
    }

    // AS3: TextPreset.as::get staticWidth()
    override get staticWidth(): number
    {
        if(this.canStretch)
        {
            return this._window.width;
        }

        throw new Error('Non stretching text has no static width');
    }

    // AS3: TextPreset.as::get window()
    override get window(): IWindow
    {
        return this._window;
    }

    // AS3: TextPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);

        if(!this.canStretch)
        {
            this._window.width = width;
        }
    }

    // AS3: TextPreset.as::get canStretch()
    get canStretch(): boolean
    {
        return this._param.mode === 0;
    }

    // AS3: TextPreset.as::get width()
    get width(): number
    {
        return this._window.width;
    }

    // AS3: TextPreset.as::get fontSize()
    get fontSize(): number
    {
        return this._window.fontSize;
    }

    // AS3: TextPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._window.dispose();
        this._window = null as unknown as ITextWindow;
        this._param = null as unknown as TextParam;
    }
}
