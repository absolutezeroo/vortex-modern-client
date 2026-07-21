import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import {WiredUIPreset} from './WiredUIPreset';

/**
 * CenteredContainerPreset — horizontally centres a static-width child preset within a container,
 * matching the container height to the child plus a top/bottom margin, re-centring on the child's
 * WE_RESIZED. Requires the child to report a static width.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/CenteredContainerPreset.as
 */
export class CenteredContainerPreset extends WiredUIPreset
{
    // AS3: CenteredContainerPreset.as::_window
    private _window: IWindowContainer;

    // AS3: CenteredContainerPreset.as::_wrapped (child preset)
    private _wrapped: WiredUIPreset;

    // AS3: CenteredContainerPreset.as::_topBottomMargin
    private _topBottomMargin: number;

    // AS3: CenteredContainerPreset.as::_ignoreListeners
    private _ignoreListeners: boolean = false;

    // AS3: CenteredContainerPreset.as::CenteredContainerPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, wrapped: WiredUIPreset, margin: number, window: IWindowContainer | null = null)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._window = window as IWindowContainer;

        if(this._window == null)
        {
            this._window = presetManager.createLayout('container_view') as unknown as IWindowContainer;
        }

        this._window.addChild(wrapped.window);
        this._wrapped = wrapped;
        this._wrapped.window.y = margin;
        this._topBottomMargin = margin;
        this._wrapped.window.addEventListener('WE_RESIZED', this._onResizeListener);

        if(!this._wrapped.hasStaticWidth())
        {
            throw new Error('CenteredContainerPreset only works with static with children');
        }
    }

    // AS3: CenteredContainerPreset.as::onResizeListener()
    private _onResizeListener = (_event: WindowEvent): void =>
    {
        if(this._ignoreListeners)
        {
            return;
        }

        this.resizeToWidth(this._window.width);
    };

    // AS3: CenteredContainerPreset.as::get window()
    override get window(): IWindow
    {
        return this._window;
    }

    // AS3: CenteredContainerPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [this._wrapped];
    }

    // AS3: CenteredContainerPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        this._ignoreListeners = true;
        super.resizeToWidth(width);
        this._window.width = width;
        this._wrapped.resizeToWidth(this._wrapped.staticWidth);
        this._window.height = this._wrapped.window.height + this._topBottomMargin * 2;
        this._wrapped.window.x = Math.trunc(width / 2 - this._wrapped.staticWidth / 2);
        this._ignoreListeners = false;
    }

    // AS3: CenteredContainerPreset.as::dispose()
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
