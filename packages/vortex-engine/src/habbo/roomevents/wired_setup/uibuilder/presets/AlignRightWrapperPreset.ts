import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import {WiredUIPreset} from './WiredUIPreset';

/**
 * AlignRightWrapperPreset — wraps a preset in a growing container and, on resize, pins the wrapped
 * preset flush to the right edge. Only valid when the wrapped preset has a static width.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/AlignRightWrapperPreset.as
 */
export class AlignRightWrapperPreset extends WiredUIPreset
{
    // AS3: AlignRightWrapperPreset.as::_window
    private _window: IWindowContainer;

    // AS3: AlignRightWrapperPreset.as::_SafeStr_5158 (wrapped preset)
    private _wrapped: WiredUIPreset;

    // AS3: AlignRightWrapperPreset.as::AlignRightWrapperPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, wrapped: WiredUIPreset)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._window = presetManager.createLayout('growing_container_view') as unknown as IWindowContainer;
        this._wrapped = wrapped;
        this._window.addChild(this._wrapped.window);
    }

    // AS3: AlignRightWrapperPreset.as::get window()
    override get window(): IWindow
    {
        return this._window;
    }

    // AS3: AlignRightWrapperPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);

        if(this._wrapped.hasStaticWidth())
        {
            const staticWidth = this._wrapped.staticWidth;
            const x = Math.max(0, width - staticWidth);

            this._wrapped.window.x = x;
            this._wrapped.resizeToWidth(this._wrapped.staticWidth);

            return;
        }

        throw new Error('Attempting to align UI preset to the right is only possible if a static width is given');
    }

    // AS3: AlignRightWrapperPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [this._wrapped];
    }

    // AS3: AlignRightWrapperPreset.as::dispose()
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
