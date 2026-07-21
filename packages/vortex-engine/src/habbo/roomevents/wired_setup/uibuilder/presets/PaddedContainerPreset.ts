import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import {WiredUIPreset} from './WiredUIPreset';

/**
 * PaddedContainerPreset — wraps a child preset in a container with left/top/right/bottom padding,
 * re-laying out on the child's WE_RESIZED. In stretch mode it reports a static width derived from the
 * child's natural width plus horizontal padding.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/PaddedContainerPreset.as
 */
export class PaddedContainerPreset extends WiredUIPreset
{
    // AS3: PaddedContainerPreset.as::_window
    protected _window: IWindowContainer;

    // AS3: PaddedContainerPreset.as::_wrapped (child preset)
    private _wrapped: WiredUIPreset;

    // AS3: PaddedContainerPreset.as::_leftPadding
    private _leftPadding: number;

    // AS3: PaddedContainerPreset.as::_top
    private _top: number;

    // AS3: PaddedContainerPreset.as::_rightPadding
    private _rightPadding: number;

    // AS3: PaddedContainerPreset.as::_bottom
    private _bottom: number;

    // AS3: PaddedContainerPreset.as::_stretchMode
    private _stretchMode: boolean;

    // AS3: PaddedContainerPreset.as::_cachedWidth
    private _cachedWidth: number = 0;

    // AS3: PaddedContainerPreset.as::_ignoreListeners
    private _ignoreListeners: boolean = false;

    // AS3: PaddedContainerPreset.as::PaddedContainerPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, wrapped: WiredUIPreset, leftPadding: number, top: number, rightPadding: number, bottom: number, window: IWindowContainer | null = null, stretchMode: boolean = false)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._leftPadding = leftPadding;
        this._top = top;
        this._rightPadding = rightPadding;
        this._bottom = bottom;
        this._stretchMode = stretchMode;
        this._window = window as IWindowContainer;

        if(this._window == null)
        {
            this._window = presetManager.createLayout('growing_container_view') as unknown as IWindowContainer;
        }

        this._window.addChild(wrapped.window);
        this._wrapped = wrapped;
        this._wrapped.window.x = this._leftPadding;
        this._wrapped.window.y = this._top;
        this._wrapped.window.addEventListener('WE_RESIZED', this._onResizeListener);
    }

    // AS3: PaddedContainerPreset.as::onResizeListener()
    private _onResizeListener = (_event: WindowEvent): void =>
    {
        if(this._ignoreListeners)
        {
            return;
        }

        this.resizeToWidth(this._cachedWidth);
    };

    // AS3: PaddedContainerPreset.as::get window()
    override get window(): IWindow
    {
        return this._window;
    }

    // AS3: PaddedContainerPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [this._wrapped];
    }

    // AS3: PaddedContainerPreset.as::hasStaticWidth()
    override hasStaticWidth(): boolean
    {
        return this._stretchMode;
    }

    // AS3: PaddedContainerPreset.as::get staticWidth()
    override get staticWidth(): number
    {
        if(this._stretchMode)
        {
            return this._wrapped.window.width + this._leftPadding + this._rightPadding;
        }

        return -1;
    }

    // AS3: PaddedContainerPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        this._cachedWidth = width;
        this._ignoreListeners = true;

        if(this._stretchMode)
        {
            width = this.staticWidth;
        }

        super.resizeToWidth(width);
        this._window.width = width;
        this._wrapped.resizeToWidth(width - this._leftPadding - this._rightPadding);
        this._window.height = this._wrapped.window.height + this._top + this._bottom;
        this._ignoreListeners = false;
    }

    // AS3: PaddedContainerPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        this._wrapped.window.removeEventListener('WE_RESIZED', this._onResizeListener);
        super.dispose();
        this._window.dispose();
        this._window = null as unknown as IWindowContainer;
        this._wrapped = null as unknown as WiredUIPreset;
    }
}
