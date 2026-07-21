import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IInteractiveWindow} from '@core/window/components/IInteractiveWindow';
import type {IIconButtonWindow} from '@core/window/components/IIconButtonWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Util} from '@habbo/roomevents/Util';

import {VariableExtraSourceTypes} from '../../common/VariableExtraSourceTypes';
import {WiredInputSourcePicker} from '../WiredInputSourcePicker';
import type {NewSourceTypePicker} from './NewSourceTypePicker';

/**
 * NewSourceTypeOption — one source-type button in the new (illumina) source-type picker. Shows the
 * type image, tracks active/hovered state via window state flags, tints itself with the source colour
 * (lightened on hover), and cancels the window's default press/drag while active.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/inputsources/newpicker/NewSourceTypeOption.as
 */
export class NewSourceTypeOption
{
    // AS3: NewSourceTypeOption.as::_picker
    private _picker: NewSourceTypePicker;

    // AS3: NewSourceTypeOption.as::_container
    private _container: IIconButtonWindow;

    // AS3: NewSourceTypeOption.as::_option (source type id)
    private _option: number;

    // AS3: NewSourceTypeOption.as::_active
    private _active: boolean = false;

    // AS3: NewSourceTypeOption.as::_hovered
    private _hovered: boolean = false;

    // AS3: NewSourceTypeOption.as::NewSourceTypeOption()
    constructor(picker: NewSourceTypePicker, container: IIconButtonWindow, option: number)
    {
        this._picker = picker;
        this._container = container;
        this._option = option;
        this._container.addEventListener('WME_CLICK', this._onClick);
        this._container.addEventListener('WME_OVER', this._onOver);
        this._container.addEventListener('WME_OUT', this._onOut);
        this._container.addEventListener('WME_OUT', this._maybeCancelEvent);
        this._container.addEventListener('WME_UP', this._maybeCancelEvent);

        const roomEvents = picker.roomEvents;
        const typeName = WiredInputSourcePicker.getTypeNameForSource(option);

        // The port's IIconButtonWindow extends IWindow only; toolTipCaption is on IInteractiveWindow
        // (AS3 _SafeCls_2168 extends it) and the concrete controller implements it.
        (this._container as unknown as IInteractiveWindow).toolTipCaption = roomEvents.localization.getLocalization('wiredfurni.params.sourcetype.' + typeName);
        this.typeImage.assetUri = 'wired_styles_illumina_icon_source_' + typeName;
        this.typeImage.y = Math.trunc((this._container.height + 1) / 2 - (this.typeImage.height + 1) / 2);
        this.updateVisuals();
    }

    // AS3: NewSourceTypeOption.as::activate()
    activate(): void
    {
        this._active = true;
        this.updateVisuals();
    }

    // AS3: NewSourceTypeOption.as::deactivate()
    deactivate(): void
    {
        this._active = false;
        this.updateVisuals();
    }

    // AS3: NewSourceTypeOption.as::updateVisuals()
    private updateVisuals(): void
    {
        this._container.setStateFlag(16, this._active);
        this._container.setStateFlag(4, this._hovered);

        if(!this._active && !this._hovered)
        {
            this._container.color = 16777215;
            this._picker.updateColorings();

            return;
        }

        let color: number;

        if(this._option === WiredInputSourcePicker.USER_SOURCE)
        {
            color = 2526761;
        }
        else if(this._option === WiredInputSourcePicker.FURNI_SOURCE)
        {
            color = 12228630;
        }
        else if(this._option === VariableExtraSourceTypes.CONTEXT_SOURCE)
        {
            color = 11558430;
        }
        else
        {
            color = 1934221;
        }

        let factor = 1.26;

        if(this._hovered && !this._active)
        {
            factor = 1.55;
        }

        color = Util.lightenColor(color, factor);
        this._container.color = color;
        this._picker.updateColorings();
    }

    // AS3: NewSourceTypeOption.as::get color()
    get color(): number
    {
        return this._container.color;
    }

    // AS3: NewSourceTypeOption.as::onOut()
    private _onOut = (_event: WindowMouseEvent): void =>
    {
        if(!this._container.isEnabled())
        {
            return;
        }

        this._hovered = false;
        this.updateVisuals();
    };

    // AS3: NewSourceTypeOption.as::maybeCancelEvent()
    private _maybeCancelEvent = (event: WindowMouseEvent): void =>
    {
        if(event.type === 'WME_OUT' && this._active)
        {
            event.preventWindowOperation();
        }

        if(event.type === 'WME_UP')
        {
            this._onClick(null);
            event.preventWindowOperation();
        }
    };

    // AS3: NewSourceTypeOption.as::onOver()
    private _onOver = (_event: WindowMouseEvent): void =>
    {
        if(!this._container.isEnabled())
        {
            return;
        }

        this._hovered = true;
        this.updateVisuals();
    };

    // AS3: NewSourceTypeOption.as::onClick()
    private _onClick = (_event: WindowMouseEvent | null): void =>
    {
        this._picker.onClick(this);
    };

    // AS3: NewSourceTypeOption.as::get option()
    get option(): number
    {
        return this._option;
    }

    // AS3: NewSourceTypeOption.as::get container()
    get container(): IIconButtonWindow
    {
        return this._container;
    }

    // AS3: NewSourceTypeOption.as::get active()
    get active(): boolean
    {
        return this._active;
    }

    // AS3: NewSourceTypeOption.as::get hovered()
    get hovered(): boolean
    {
        return this._hovered;
    }

    // AS3: NewSourceTypeOption.as::dispose()
    dispose(): void
    {
        if(this._container != null)
        {
            this._container.dispose();
            this._container = null as unknown as IIconButtonWindow;
        }
    }

    // AS3: NewSourceTypeOption.as::get typeImage()
    private get typeImage(): IStaticBitmapWrapperWindow
    {
        return (this._container as unknown as IWindowContainer).findChildByName('type_image') as unknown as IStaticBitmapWrapperWindow;
    }
}
