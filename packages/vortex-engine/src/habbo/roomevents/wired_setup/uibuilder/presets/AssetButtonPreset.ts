import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IInteractiveWindow} from '@core/window/components/IInteractiveWindow';
import type {IIconButtonWindow} from '@core/window/components/IIconButtonWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import {WiredUIPreset} from './WiredUIPreset';

/**
 * AssetButtonPreset — a fixed-width asset (bitmap) button with a tooltip and selected/hovered/pressed
 * visual states (state flags differ between volter and non-volter styles). Fires the callback on
 * click, cancelling the window's default press/drag while selected.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/AssetButtonPreset.as
 */
export class AssetButtonPreset extends WiredUIPreset
{
    // AS3: AssetButtonPreset.as::_container
    private _container: IIconButtonWindow;

    // AS3: AssetButtonPreset.as::_onClick
    private _onClick: (() => void) | null;

    // AS3: AssetButtonPreset.as::_selected
    private _selected: boolean = false;

    // AS3: AssetButtonPreset.as::_hovered
    private _hovered: boolean = false;

    // AS3: AssetButtonPreset.as::_pressed
    private _pressed: boolean = false;

    // AS3: AssetButtonPreset.as::AssetButtonPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, assetName: string, tooltip: string, onClick: (() => void) | null)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._onClick = onClick;
        this._container = wiredStyle.createAssetButton();
        this.staticBitmap.assetUri = this.resolveAssetFullName(assetName);
        (this._container as unknown as IInteractiveWindow).toolTipCaption = tooltip;
        this._container.addEventListener('WME_CLICK', this._onButtonClicked);
        this._container.addEventListener('WME_OVER', this._onOver);
        this._container.addEventListener('WME_OUT', this._onOut);
        this._container.addEventListener('WME_OUT', this._maybeCancelEvent);
        this._container.addEventListener('WME_UP', this._maybeCancelEvent);
        this._container.addEventListener('WME_DOWN', this._onDown);
    }

    // AS3: AssetButtonPreset.as::buttonClicked()
    private buttonClicked(_event: WindowMouseEvent | null): void
    {
        if(this._onClick != null)
        {
            this._onClick();
        }
    }

    // AS3: AssetButtonPreset.as::set assetName()
    set assetName(value: string)
    {
        this.staticBitmap.assetUri = this.resolveAssetFullName(value);
    }

    // AS3: AssetButtonPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: AssetButtonPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
    }

    // AS3: AssetButtonPreset.as::onOut()
    private _onOut = (_event: WindowMouseEvent): void =>
    {
        if(!this._container.isEnabled())
        {
            return;
        }

        this._hovered = false;
        this.updateVisuals();
    };

    // AS3: AssetButtonPreset.as::onOver()
    private _onOver = (_event: WindowMouseEvent): void =>
    {
        if(!this._container.isEnabled())
        {
            return;
        }

        this._hovered = true;
        this.updateVisuals();
    };

    // AS3: AssetButtonPreset.as::onButtonClicked()
    private _onButtonClicked = (_event: WindowMouseEvent): void =>
    {
        if(this._onClick != null)
        {
            this._onClick();
        }
    };

    // AS3: AssetButtonPreset.as::maybeCancelEvent()
    private _maybeCancelEvent = (event: WindowMouseEvent): void =>
    {
        if(event.type === 'WME_OUT' && this._selected)
        {
            event.preventWindowOperation();
        }

        if(event.type === 'WME_UP')
        {
            this._pressed = false;

            if(this._selected)
            {
                this.buttonClicked(null);
                event.preventWindowOperation();
            }
        }
    };

    // AS3: AssetButtonPreset.as::onDown()
    private _onDown = (_event: WindowMouseEvent): void =>
    {
        this._pressed = false;
    };

    // AS3: AssetButtonPreset.as::updateVisuals()
    private updateVisuals(): void
    {
        if(this._wiredStyle.isVolter)
        {
            this._container.setStateFlag(16, this._pressed);
            this._container.setStateFlag(4, this._hovered || this._selected);
        }
        else
        {
            this._container.setStateFlag(16, this._selected);
            this._container.setStateFlag(4, this._hovered);
        }
    }

    // AS3: AssetButtonPreset.as::get selected()
    get selected(): boolean
    {
        return this._selected;
    }

    // AS3: AssetButtonPreset.as::set selected()
    set selected(value: boolean)
    {
        this._selected = value;
        this.updateVisuals();
    }

    // AS3: AssetButtonPreset.as::hasStaticWidth()
    override hasStaticWidth(): boolean
    {
        return true;
    }

    // AS3: AssetButtonPreset.as::get staticWidth()
    override get staticWidth(): number
    {
        return this._container.width;
    }

    // AS3: AssetButtonPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as IIconButtonWindow;
        this._onClick = null;
    }

    // AS3: AssetButtonPreset.as::get staticBitmap()
    private get staticBitmap(): IStaticBitmapWrapperWindow
    {
        return (this._container as unknown as IWindowContainer).findChildByName('asset') as unknown as IStaticBitmapWrapperWindow;
    }
}
