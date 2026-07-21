import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';
import {Util} from '@habbo/roomevents/Util';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import type {CheckboxOptionParam} from '../params/CheckboxOptionParam';
import {TextParam} from '../params/TextParam';
import {WiredUIPreset} from './WiredUIPreset';
import type {TextPreset} from './TextPreset';
import type {StaticBitmapAssetWrapperPreset} from './StaticBitmapAssetWrapperPreset';

/**
 * CheckboxOptionPreset — one labelled checkbox row (checkbox + optional icon + optional text), with
 * optional inline (extra1) and below (extra2) presets that are enabled only while the box is checked.
 * Lays the row out horizontally and stacks the below-extra underneath.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/CheckboxOptionPreset.as
 */
export class CheckboxOptionPreset extends WiredUIPreset
{
    // AS3: CheckboxOptionPreset.as::_container
    private _container: IWindowContainer;

    // AS3: CheckboxOptionPreset.as::_vertical (stacks the row and the below-extra)
    private _vertical: IItemListWindow;

    // AS3: CheckboxOptionPreset.as::_horizontal (checkbox + icon + text + inline-extra)
    private _horizontal: IItemListWindow;

    // AS3: CheckboxOptionPreset.as::_checkbox
    private _checkbox: ISelectableWindow;

    // AS3: CheckboxOptionPreset.as::_text
    private _text: TextPreset | null = null;

    // AS3: CheckboxOptionPreset.as::_icon
    private _icon: StaticBitmapAssetWrapperPreset | null = null;

    // AS3: CheckboxOptionPreset.as::_extra1 (inline extra)
    private _extra1: WiredUIPreset | null = null;

    // AS3: CheckboxOptionPreset.as::_extra2 (below extra)
    private _extra2: WiredUIPreset | null = null;

    // AS3: CheckboxOptionPreset.as::_last
    private _last: boolean;

    // AS3: CheckboxOptionPreset.as::CheckboxOptionPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, param: CheckboxOptionParam, last: boolean = false)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._container = presetManager.createLayout('growing_container_view') as unknown as IWindowContainer;
        this._vertical = presetManager.createLayout('vertical_list_view') as unknown as IItemListWindow;
        this._horizontal = presetManager.createLayout('horizontal_list_view') as unknown as IItemListWindow;
        this._last = last;
        this._checkbox = wiredStyle.createCheckboxView();
        this._checkbox.id = param.id;

        if(param.text != null && param.text !== '')
        {
            this._text = presetManager.createText(param.text, new TextParam(param.extra1 != null ? 0 : 1));
        }

        if(param.iconAssetName != null && param.iconAssetName !== '')
        {
            this._icon = presetManager.createBitmapWrapperPreset(this.resolveAssetFullName(param.iconAssetName));
        }

        if(wiredStyle.checkboxYOffset > 0)
        {
            if(this._text != null)
            {
                this._text.window.y = wiredStyle.checkboxYOffset;
            }

            if(this._icon != null)
            {
                this._icon.window.y = wiredStyle.checkboxYOffset;
            }
        }
        else if(wiredStyle.checkboxYOffset < 0)
        {
            this._checkbox.y = -wiredStyle.checkboxYOffset;
        }

        this._horizontal.addListItem(this._checkbox);

        if(this._icon != null)
        {
            this._horizontal.addListItem(this._icon.window);
        }

        if(this._text != null)
        {
            this._horizontal.addListItem(this._text.window);
        }

        this._horizontal.spacing = wiredStyle.checkboxSpacing;

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
            this._checkbox.addEventListener('WE_SELECTED', this._onSelect);
            this._checkbox.addEventListener('WE_UNSELECTED', this._onUnSelect);
            this._onUnSelect(null);
        }

        this._container.addChild(this._vertical);
    }

    // AS3: CheckboxOptionPreset.as::onSelect()
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

    // AS3: CheckboxOptionPreset.as::onUnSelect()
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

    // AS3: CheckboxOptionPreset.as::get disabled()
    // (TS: the base defines a get/set pair; overriding only the setter would drop the getter, so the
    // inherited getter is re-exposed here.)
    override get disabled(): boolean
    {
        return super.disabled;
    }

    // AS3: CheckboxOptionPreset.as::set disabled()
    override set disabled(value: boolean)
    {
        super.disabled = value;

        if(!value && !this.selected)
        {
            this._onUnSelect(null);
        }
    }

    // AS3: CheckboxOptionPreset.as::set selected()
    set selected(value: boolean)
    {
        Util.select(this._checkbox, value);
    }

    // AS3: CheckboxOptionPreset.as::get selected()
    get selected(): boolean
    {
        return this._checkbox.isSelected;
    }

    // AS3: CheckboxOptionPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._container.width = width;
        this._vertical.width = width;
        this._horizontal.width = width;

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

        let rowHeight = this._checkbox.height + this._checkbox.y;

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

            this._checkbox.y = offset;

            if(this._text != null)
            {
                this._text.window.y = offset + this._wiredStyle.checkboxYOffset;
            }

            if(this._icon != null)
            {
                this._icon.window.y = offset + this._wiredStyle.checkboxYOffset;
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

    // AS3: CheckboxOptionPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: CheckboxOptionPreset.as::get checkbox()
    get checkbox(): ISelectableWindow
    {
        return this._checkbox;
    }

    // AS3: CheckboxOptionPreset.as::get childPresets()
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

    // AS3: CheckboxOptionPreset.as::dispose()
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
        this._checkbox = null as unknown as ISelectableWindow;
        this._extra1 = null;
        this._extra2 = null;
    }
}
