import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';

import {VariableExtraSourceTypes} from '../common/VariableExtraSourceTypes';
import {WiredInputSourcePicker} from './WiredInputSourcePicker';
import type {SourceTypePicker} from './SourceTypePicker';

/**
 * SourceTypeOption — one clickable source-type icon in the (old) source-type picker: shows the type
 * icon + tooltip, tracks active/hovered/disabled state and paints its background accordingly, and
 * notifies the picker on click.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/inputsources/SourceTypeOption.as
 */
export class SourceTypeOption
{
    // AS3: SourceTypeOption.as::_picker
    private _picker: SourceTypePicker;

    // AS3: SourceTypeOption.as::_container
    private _container: IRegionWindow;

    // AS3: SourceTypeOption.as::_option (source type id)
    private _option: number;

    // AS3: SourceTypeOption.as::_active
    private _active: boolean = false;

    // AS3: SourceTypeOption.as::_hovered
    private _hovered: boolean = false;

    // AS3: SourceTypeOption.as::_disabled
    private _disabled: boolean = false;

    // AS3: SourceTypeOption.as::SourceTypeOption()
    constructor(picker: SourceTypePicker, container: IRegionWindow, option: number)
    {
        this._picker = picker;
        this._container = container;
        this._option = option;
        this._container.addEventListener('WME_CLICK', this._onClick);
        this._container.addEventListener('WME_OVER', this._onOver);
        this._container.addEventListener('WME_OUT', this._onOut);

        const roomEvents = picker.roomEvents;
        const typeName = WiredInputSourcePicker.getTypeNameForSource(option);

        this._container.toolTipCaption = roomEvents.localization.getLocalization('wiredfurni.params.sourcetype.' + typeName);
        this.bitmapContainer.bitmap = roomEvents.getButtonImage('icon_source_' + typeName);
        this.updateColoring();
    }

    // AS3: SourceTypeOption.as::activate()
    activate(): void
    {
        this._active = true;
        this.updateColoring();
    }

    // AS3: SourceTypeOption.as::deactivate()
    deactivate(): void
    {
        this._active = false;
        this.updateColoring();
    }

    // AS3: SourceTypeOption.as::onOut()
    private _onOut = (_event: WindowMouseEvent): void =>
    {
        if(this._disabled || !this._container.isEnabled())
        {
            return;
        }

        this._hovered = false;
        this.updateColoring();
    };

    // AS3: SourceTypeOption.as::onOver()
    private _onOver = (_event: WindowMouseEvent): void =>
    {
        if(this._disabled || !this._container.isEnabled())
        {
            return;
        }

        this._hovered = true;
        this.updateColoring();
    };

    // AS3: SourceTypeOption.as::onClick()
    private _onClick = (_event: WindowMouseEvent): void =>
    {
        this._picker.onClick(this);
    };

    // AS3: SourceTypeOption.as::backgroundColor() (AS3 `internal`; read cross-instance by the picker)
    backgroundColor(): number
    {
        if(!this._active && !this._hovered)
        {
            return 2236962;
        }

        let base: number;

        if(this._option === WiredInputSourcePicker.USER_SOURCE)
        {
            base = 2526761;
        }
        else if(this._option === WiredInputSourcePicker.FURNI_SOURCE)
        {
            base = 12228630;
        }
        else if(this._option === VariableExtraSourceTypes.CONTEXT_SOURCE)
        {
            base = 11558430;
        }
        else
        {
            base = 1934221;
        }

        let r = (base >> 16) & 0xFF;
        let g = (base >> 8) & 0xFF;
        let b = base & 0xFF;

        r *= 0.5;
        g *= 0.5;
        b *= 0.5;

        return ((r << 16) + (g << 8) + b) >>> 0;
    }

    // AS3: SourceTypeOption.as::updateColoring()
    private updateColoring(): void
    {
        this.elements.color = (0xFF000000 | this.backgroundColor()) >>> 0;
        this._picker.colorHasUpdated(this);
    }

    // AS3: SourceTypeOption.as::get option()
    get option(): number
    {
        return this._option;
    }

    // AS3: SourceTypeOption.as::get container()
    get container(): IRegionWindow
    {
        return this._container;
    }

    // AS3: SourceTypeOption.as::set disabled()
    set disabled(value: boolean)
    {
        if(value)
        {
            this._container.disable();
        }
        else
        {
            this._container.enable();
        }

        const blend = value ? 0.5 : 1;

        this.elements.blend = blend;
        this.bitmapContainer.blend = blend;
        this._disabled = value;
        this.updateColoring();
    }

    // AS3: SourceTypeOption.as::dispose()
    dispose(): void
    {
        if(this._container != null)
        {
            this._container.dispose();
            this._container = null as unknown as IRegionWindow;
        }
    }

    // AS3: SourceTypeOption.as::get bitmapContainer()
    private get bitmapContainer(): IBitmapWrapperWindow
    {
        return this._container.findChildByName('type_icon_bitmap') as unknown as IBitmapWrapperWindow;
    }

    // AS3: SourceTypeOption.as::get elements()
    private get elements(): IItemListWindow
    {
        return this._container.findChildByName('source_elements') as unknown as IItemListWindow;
    }
}
