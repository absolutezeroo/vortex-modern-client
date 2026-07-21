import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import type {TextAreaParam} from '../params/TextAreaParam';
import {TextParam} from '../params/TextParam';
import {WiredUIPreset} from './WiredUIPreset';
import type {TextPreset} from './TextPreset';

/**
 * TextAreaPreset — a multi-line text field of fixed height with word wrap, optional placeholder text
 * (shown while empty), and a max-character limit warning. Normalises line endings to `\n` on read and
 * `\r` on write.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/TextAreaPreset.as
 */
export class TextAreaPreset extends WiredUIPreset
{
    // AS3: TextAreaPreset.as::_container
    private _container: IWindowContainer;

    // AS3: TextAreaPreset.as::_input (the input template window)
    private _input: IWindowContainer;

    // AS3: TextAreaPreset.as::_field
    private _field: ITextFieldWindow;

    // AS3: TextAreaPreset.as::_placeholder
    private _placeholder: TextPreset | null = null;

    // AS3: TextAreaPreset.as::_param
    private _param: TextAreaParam;

    // AS3: TextAreaPreset.as::_widthDelta
    private _widthDelta: number;

    // AS3: TextAreaPreset.as::TextAreaPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, param: TextAreaParam)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._container = presetManager.createLayout('growing_container_view') as unknown as IWindowContainer;
        this._input = wiredStyle.createTextInputView() as unknown as IWindowContainer;
        this._field = this._input.findChildByName('field') as unknown as ITextFieldWindow;
        this._widthDelta = this._input.width - this._field.width;
        this._param = param;

        if(param.maxCharacters > 0)
        {
            this._field.maxChars = param.maxCharacters;
        }

        this._field.text = this._param.initialText;
        this._field.multiline = true;
        this._field.wordWrap = param.wordwrap;

        if(param.width >= 0)
        {
            this._input.width = param.width + this._widthDelta;
        }

        this._input.height = param.height;

        if(param.maxLines >= 0)
        {
            this._field.maxLines = param.maxLines;
        }

        this._field.editable = param.editable;

        // TODO(AS3): AS3 sets `_field.restrict = param.restrict` (input character mask). The port's
        // ITextFieldWindow has no `restrict`, so the mask is not applied.
        if(param.tooltip != null)
        {
            this._field.toolTipCaption = param.tooltip;
        }

        this._container.addChild(this._input);

        if(param.placeholder != null)
        {
            this._placeholder = presetManager.createText(param.placeholder, new TextParam(1));
            this._placeholder.window.blend = 0.5;
            this._placeholder.window.tags.push('HALF_BLEND');
            this._placeholder.window.x = this._field.x;
            this._placeholder.window.y = this._field.y;
            this._container.addChild(this._placeholder.window);
        }

        this._field.addEventListener('WE_CHANGE', this._textHasChanged);
        this._textHasChanged(null);
    }

    // AS3: TextAreaPreset.as::textHasChanged()
    private _textHasChanged = (_event: WindowEvent | null): void =>
    {
        if(this._placeholder != null)
        {
            this._placeholder.visible = this._field.length === 0;
        }

        this.updateWarn();
    };

    // AS3: TextAreaPreset.as::get text()
    get text(): string
    {
        return this._field.text.replace(/\n\r/g, '\n').replace(/\r/g, '\n');
    }

    // AS3: TextAreaPreset.as::set text()
    set text(value: string)
    {
        this._field.text = value.replace(/\n/g, '\r');
        this._textHasChanged(null);
    }

    // AS3: TextAreaPreset.as::reset()
    reset(): void
    {
        this._field.text = '';
        this._textHasChanged(null);
    }

    // AS3: TextAreaPreset.as::shouldShowWarn()
    private shouldShowWarn(): boolean
    {
        const maxChars = this._param.maxCharacters;

        if(maxChars <= 10)
        {
            return false;
        }

        const threshold = Math.trunc(Math.min(30, Math.max(6, maxChars / 5)));

        return this._field.text.length > maxChars - threshold;
    }

    // AS3: TextAreaPreset.as::updateWarn()
    private updateWarn(): void
    {
        if(this.charLimitWarnArea == null)
        {
            return;
        }

        const show = this.shouldShowWarn();

        this.charLimitWarnArea.visible = show;

        if(show)
        {
            this.limitText.text = this._field.text.length + '/' + this._param.maxCharacters;
        }
    }

    // AS3: TextAreaPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);

        const inputWidth = this._param.width >= 0 ? this._param.width + this._widthDelta : width;

        this._input.width = inputWidth;

        if(this._placeholder != null)
        {
            this._placeholder.resizeToWidth(inputWidth - this._widthDelta);
        }
    }

    // AS3: TextAreaPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: TextAreaPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return this._placeholder == null ? [] : [this._placeholder];
    }

    // AS3: TextAreaPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as IWindowContainer;
        this._input = null as unknown as IWindowContainer;
        this._placeholder = null;
        this._param = null as unknown as TextAreaParam;
    }

    // AS3: TextAreaPreset.as::get charLimitWarnArea()
    private get charLimitWarnArea(): IWindowContainer | null
    {
        return this._container.findChildByName('char_limit_warn') as unknown as IWindowContainer | null;
    }

    // AS3: TextAreaPreset.as::get limitText()
    private get limitText(): ITextWindow
    {
        return this._container.findChildByName('limit_text') as unknown as ITextWindow;
    }
}
