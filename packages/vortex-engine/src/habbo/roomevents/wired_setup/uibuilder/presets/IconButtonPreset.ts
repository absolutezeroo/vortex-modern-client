import type {IWindow} from '@core/window/IWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import {WiredUIPreset} from './WiredUIPreset';

/**
 * IconButtonPreset — a fixed-width icon button (the style's `iconbutton_<name>` view) that fires the
 * supplied callback on click.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/IconButtonPreset.as
 */
export class IconButtonPreset extends WiredUIPreset
{
    // AS3: IconButtonPreset.as::_container
    private _container: IWindow;

    // AS3: IconButtonPreset.as::_onClick (click callback)
    private _onClick: (() => void) | null;

    // AS3: IconButtonPreset.as::IconButtonPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, name: string, onClick: (() => void) | null)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._container = wiredStyle.createIconButton(name);
        this._onClick = onClick;
        this._container.addEventListener('WME_CLICK', this._iconClicked);
    }

    // AS3: IconButtonPreset.as::iconClicked()
    private _iconClicked = (_event: WindowMouseEvent): void =>
    {
        if(this._onClick != null)
        {
            this._onClick();
        }
    };

    // AS3: IconButtonPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: IconButtonPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._container.width = width;
    }

    // AS3: IconButtonPreset.as::hasStaticWidth()
    override hasStaticWidth(): boolean
    {
        return true;
    }

    // AS3: IconButtonPreset.as::get staticWidth()
    override get staticWidth(): number
    {
        return this._container.width;
    }

    // AS3: IconButtonPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as IWindow;
        this._onClick = null;
    }
}
