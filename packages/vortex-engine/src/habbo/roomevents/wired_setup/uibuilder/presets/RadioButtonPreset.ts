import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IRadioButtonWindow} from '@core/window/components/IRadioButtonWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import type {RadioButtonParam} from '../params/RadioButtonParam';
import {TextParam} from '../params/TextParam';
import {WiredUIPreset} from './WiredUIPreset';
import type {TextPreset} from './TextPreset';
import type {StaticBitmapAssetWrapperPreset} from './StaticBitmapAssetWrapperPreset';

/**
 * RadioButtonPreset — one radio option row (radio + optional icon + optional text), named
 * `option_<id>` so its owning RadioGroup's selector can find and select it, with optional inline
 * (extra1) and below (extra2) presets enabled only while selected. Carries its grid position for
 * multi-column groups.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/RadioButtonPreset.as
 */
export class RadioButtonPreset extends WiredUIPreset
{
    // AS3: RadioButtonPreset.as::OPTION_PREFIX
    public static readonly OPTION_PREFIX: string = 'option_';

    // AS3: RadioButtonPreset.as::_container
    private _container: IWindowContainer;

    // AS3: RadioButtonPreset.as::_vertical
    private _vertical: IItemListWindow;

    // AS3: RadioButtonPreset.as::_horizontal
    private _horizontal: IItemListWindow;

    // AS3: RadioButtonPreset.as::_text
    private _text: TextPreset | null = null;

    // AS3: RadioButtonPreset.as::_icon
    private _icon: StaticBitmapAssetWrapperPreset | null = null;

    // AS3: RadioButtonPreset.as::_radio
    private _radio: IRadioButtonWindow;

    // AS3: RadioButtonPreset.as::_layoutRowIndex
    private _layoutRowIndex: number = -1;

    // AS3: RadioButtonPreset.as::_layoutColumnIndex
    private _layoutColumnIndex: number = -1;

    // AS3: RadioButtonPreset.as::_spanRemainingWidth
    private _spanRemainingWidth: boolean = false;

    // AS3: RadioButtonPreset.as::_extra1
    private _extra1: WiredUIPreset | null = null;

    // AS3: RadioButtonPreset.as::_extra2
    private _extra2: WiredUIPreset | null = null;

    // AS3: RadioButtonPreset.as::_last
    private _last: boolean;

    // AS3: RadioButtonPreset.as::RadioButtonPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, param: RadioButtonParam, last: boolean = false)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._container = presetManager.createLayout('container_view') as unknown as IWindowContainer;
        this._vertical = presetManager.createLayout('vertical_list_view') as unknown as IItemListWindow;
        this._horizontal = presetManager.createLayout('horizontal_list_view') as unknown as IItemListWindow;
        this._last = last;
        this._radio = wiredStyle.createRadioButtonView();

        if(param.text != null && param.text !== '')
        {
            this._text = presetManager.createText(param.text, new TextParam(param.extra1 != null ? 0 : 1));
        }

        if(param.iconAssetName != null && param.iconAssetName !== '')
        {
            this._icon = presetManager.createBitmapWrapperPreset(this.resolveAssetFullName(param.iconAssetName));
        }

        if(wiredStyle.radioButtonYOffset > 0)
        {
            if(this._text != null)
            {
                this._text.window.y = wiredStyle.radioButtonYOffset;
            }

            if(this._icon != null)
            {
                this._icon.window.y = wiredStyle.radioButtonYOffset;
            }
        }
        else if(wiredStyle.radioButtonYOffset < 0)
        {
            this._radio.y = -wiredStyle.radioButtonYOffset;
        }

        this._radio.name = RadioButtonPreset.OPTION_PREFIX + param.id;
        this._radio.id = param.id;
        this._horizontal.addListItem(this._radio);

        if(this._icon != null)
        {
            this._horizontal.addListItem(this._icon.window);
        }

        if(this._text != null)
        {
            this._horizontal.addListItem(this._text.window);
        }

        this._horizontal.spacing = wiredStyle.radioButtonSpacing;

        if(param.extra1 != null)
        {
            this._extra1 = param.extra1;
            this._horizontal.addListItem(this._extra1.window);
        }

        this._vertical.addListItem(this._horizontal);
        this._vertical.spacing = wiredStyle.optionExtraUnderSpacing;

        if(param.extra2 != null)
        {
            this._extra2 = param.extra2;
            this._vertical.addListItem(this._extra2.window);
            this._extra2.window.x = wiredStyle.optionExtraUnderLeftMargin;
        }

        if(this._extra1 != null || this._extra2 != null)
        {
            this._radio.addEventListener('WE_SELECTED', this._onSelect);
            this._radio.addEventListener('WE_UNSELECTED', this._onUnSelect);
            this._onUnSelect(null);
        }

        this._container.addChild(this._vertical);
    }

    // AS3: RadioButtonPreset.as::set text()
    set text(value: string)
    {
        if(this._text != null)
        {
            this._text.text = value;
        }
    }

    // AS3: RadioButtonPreset.as::onSelect()
    private _onSelect = (_event: WindowEvent | null): void =>
    {
        if(this._extra1 != null)
        {
            this._extra1.disabled = false;
        }

        if(this._extra2 != null)
        {
            this._extra2.disabled = false;
        }
    };

    // AS3: RadioButtonPreset.as::onUnSelect()
    private _onUnSelect = (_event: WindowEvent | null): void =>
    {
        if(this._extra1 != null)
        {
            this._extra1.disabled = true;
        }

        if(this._extra2 != null)
        {
            this._extra2.disabled = true;
        }
    };

    // AS3: RadioButtonPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._horizontal.width = width;
        this._container.width = width;
        this._vertical.width = width;

        if(this._text != null && !this._text.canStretch && this._extra1 != null)
        {
            throw new Error('Illegal UI combination: could not determine width of text');
        }

        if(this._text != null && this._extra1 == null)
        {
            this._text.resizeToWidth(width - this._text.window.x);
        }
        else if(this._text != null)
        {
            this._text.resizeToWidth(this._text.width);
        }

        if(this._extra1 != null)
        {
            this._extra1.resizeToWidth(width - this._extra1.window.x);
        }

        if(this._extra2 != null)
        {
            this._extra2.resizeToWidth(width - this._extra2.window.x);
        }

        let rowHeight = this._radio.height + this._radio.y;

        if(this._text != null)
        {
            rowHeight = Math.max(rowHeight, this._text.window.height + this._text.window.y);
        }

        if(this._icon != null)
        {
            rowHeight = Math.max(rowHeight, this._icon.window.height + this._icon.window.y);
        }

        if(this._extra1 != null && this._extra1.window.height > rowHeight)
        {
            const offset = Math.trunc((this._extra1.window.height - rowHeight) / 2);

            this._radio.y = offset;

            if(this._text != null)
            {
                this._text.window.y = offset + this._wiredStyle.radioButtonYOffset;
            }

            if(this._icon != null)
            {
                this._icon.window.y = offset + this._wiredStyle.radioButtonYOffset;
            }

            rowHeight = this._extra1.window.height;
        }

        this._horizontal.height = rowHeight;

        if(!this._last)
        {
            this._container.height = Math.max(this._vertical.height + this._wiredStyle.minimumOptionSpacing, this._wiredStyle.minimumOptionHeight);
        }
        else
        {
            this._container.height = this._vertical.height;
        }
    }

    // AS3: RadioButtonPreset.as::get radioButton()
    get radioButton(): IRadioButtonWindow
    {
        return this._radio;
    }

    // AS3: RadioButtonPreset.as::set layoutRowIndex()
    set layoutRowIndex(value: number)
    {
        this._layoutRowIndex = value;
    }

    // AS3: RadioButtonPreset.as::get layoutRowIndex()
    get layoutRowIndex(): number
    {
        return this._layoutRowIndex;
    }

    // AS3: RadioButtonPreset.as::set layoutColumnIndex()
    set layoutColumnIndex(value: number)
    {
        this._layoutColumnIndex = value;
    }

    // AS3: RadioButtonPreset.as::get layoutColumnIndex()
    get layoutColumnIndex(): number
    {
        return this._layoutColumnIndex;
    }

    // AS3: RadioButtonPreset.as::set spanRemainingWidth()
    set spanRemainingWidth(value: boolean)
    {
        this._spanRemainingWidth = value;
    }

    // AS3: RadioButtonPreset.as::get spanRemainingWidth()
    get spanRemainingWidth(): boolean
    {
        return this._spanRemainingWidth;
    }

    // AS3: RadioButtonPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: RadioButtonPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        const presets: WiredUIPreset[] = [];

        if(this._text != null)
        {
            presets.push(this._text);
        }

        if(this._icon != null)
        {
            presets.push(this._icon);
        }

        if(this._extra1 != null)
        {
            presets.push(this._extra1);
        }

        if(this._extra2 != null)
        {
            presets.push(this._extra2);
        }

        return presets;
    }

    // AS3: RadioButtonPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as IWindowContainer;
        this._vertical = null as unknown as IItemListWindow;
        this._horizontal = null as unknown as IItemListWindow;
        this._text = null;
        this._icon = null;
        this._radio = null as unknown as IRadioButtonWindow;
        this._extra1 = null;
        this._extra2 = null;
    }
}
