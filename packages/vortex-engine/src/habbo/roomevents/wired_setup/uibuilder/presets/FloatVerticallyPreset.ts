import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import {WiredUIPreset} from './WiredUIPreset';

/**
 * FloatVerticallyPreset — wraps a preset in a zero-height container so the wrapped preset floats
 * (overflows vertically) without contributing to the parent list's height accounting. The wrapped
 * window is flagged to share the parent graphic context (param flag 16 cleared).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/FloatVerticallyPreset.as
 */
export class FloatVerticallyPreset extends WiredUIPreset
{
    // AS3: FloatVerticallyPreset.as::_window
    private _window: IWindowContainer;

    // AS3: FloatVerticallyPreset.as::_SafeStr_5158 (wrapped preset)
    private _wrapped: WiredUIPreset;

    // AS3: FloatVerticallyPreset.as::FloatVerticallyPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, wrapped: WiredUIPreset)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._window = presetManager.createLayout('container_view') as unknown as IWindowContainer;
        this._wrapped = wrapped;
        this._window.addChild(this._wrapped.window);
        this._window.height = 1;
        this._window.width = this._wrapped.window.width;
        this._wrapped.window.setParamFlag(16, false);
    }

    // AS3: FloatVerticallyPreset.as::get window()
    override get window(): IWindow
    {
        return this._window;
    }

    // AS3: FloatVerticallyPreset.as::hasStaticWidth()
    override hasStaticWidth(): boolean
    {
        return this._wrapped.hasStaticWidth();
    }

    // AS3: FloatVerticallyPreset.as::get staticWidth()
    override get staticWidth(): number
    {
        return this._wrapped.staticWidth;
    }

    // AS3: FloatVerticallyPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);

        if(!this._wrapped.hasStaticWidth())
        {
            this._window.width = width;
            this._wrapped.resizeToWidth(width);
        }
        else
        {
            this._wrapped.resizeToWidth(this._wrapped.staticWidth);
        }
    }

    // AS3: FloatVerticallyPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [this._wrapped];
    }

    // AS3: FloatVerticallyPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._window.dispose();
        this._window = null as unknown as IWindowContainer;
        this._wrapped = null as unknown as WiredUIPreset;
    }
}
