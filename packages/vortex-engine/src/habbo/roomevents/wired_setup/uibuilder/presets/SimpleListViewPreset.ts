import type {IWindow} from '@core/window/IWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import type {IListPreset} from './interfaces/IListPreset';
import {WiredUIPreset} from './WiredUIPreset';

/**
 * SimpleListViewPreset — lays out child presets in a vertical or horizontal item list. Vertical lists
 * stretch every child to the width; horizontal lists distribute the width between static- and
 * flexible-width children and match the row height to the tallest child. Re-arranges when a child's
 * visibility changes.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/SimpleListViewPreset.as
 */
export class SimpleListViewPreset extends WiredUIPreset implements IListPreset
{
    // AS3: SimpleListViewPreset.as::_container
    private _container: IItemListWindow;

    // AS3: SimpleListViewPreset.as::_items
    private _items: WiredUIPreset[];

    // AS3: SimpleListViewPreset.as::_vertical
    private _vertical: boolean;

    // AS3: SimpleListViewPreset.as::_centered
    private _centered: boolean;

    // AS3: SimpleListViewPreset.as::_allChildrenStaticWidth
    private _allChildrenStaticWidth: boolean = false;

    // AS3: SimpleListViewPreset.as::_staticWidth
    private _staticWidth: number = 0;

    // AS3: SimpleListViewPreset.as::SimpleListViewPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, vertical: boolean, presets: WiredUIPreset[], centered: boolean)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._container = (vertical ? presetManager.createLayout('vertical_list_view') : presetManager.createLayout('horizontal_list_view')) as unknown as IItemListWindow;
        this._vertical = vertical;
        this._centered = centered;
        this._container.spacing = vertical ? wiredStyle.genericHorizontalSpacing : wiredStyle.genericVerticalSpacing;
        this._items = [];

        for(const preset of presets)
        {
            this._items.push(preset);
            this._container.addListItem(preset.window);
            preset.invisibilityListener = this;
        }

        if(!vertical)
        {
            this._allChildrenStaticWidth = true;
            this._staticWidth = 0;

            for(const preset of this._items)
            {
                if(!preset.hasStaticWidth())
                {
                    this._allChildrenStaticWidth = false;
                    break;
                }

                this._staticWidth += preset.staticWidth;
            }

            if(this._allChildrenStaticWidth && this._items.length > 1)
            {
                this._staticWidth += this._container.spacing * (this._items.length - 1);
            }

            if(this._allChildrenStaticWidth)
            {
                this._container.width = this._staticWidth;
            }
        }
    }

    // AS3: SimpleListViewPreset.as::onInvisibilityChanged()
    protected override onInvisibilityChanged(_preset: WiredUIPreset, _visible: boolean): void
    {
        this._container.arrangeListItems();
        this.resize();
    }

    // AS3: SimpleListViewPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: SimpleListViewPreset.as::set spacing()
    set spacing(value: number)
    {
        this._container.spacing = value;
    }

    // AS3: SimpleListViewPreset.as::get spacing()
    get spacing(): number
    {
        return this._container.spacing;
    }

    // AS3: SimpleListViewPreset.as::set minHeight()
    set minHeight(value: number)
    {
        this._container.limits.minHeight = value;
    }

    // AS3: SimpleListViewPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);

        let visibleCount = 0;

        for(const preset of this._items)
        {
            if(preset.visible)
            {
                visibleCount += 1;
            }
        }

        if(this._vertical)
        {
            this._container.width = width;

            for(const preset of this._items)
            {
                preset.resizeToWidth(width);
            }

            if(this._centered)
            {
                throw new Error('Centering vertical lists not implemented yet');
            }
        }
        else
        {
            const totalWidth = this._allChildrenStaticWidth ? this._staticWidth : width;
            let remaining = totalWidth - (visibleCount - 1) * this._container.spacing;
            let flexCount = 0;

            for(const preset of this._items)
            {
                if(preset.visible)
                {
                    if(preset.hasStaticWidth())
                    {
                        remaining -= preset.staticWidth;
                    }
                    else
                    {
                        flexCount += 1;
                    }
                }
            }

            const flexWidth = Math.max(0, Math.trunc(remaining / flexCount));
            let maxHeight = Math.trunc(this._container.limits.minHeight);

            for(const preset of this._items)
            {
                if(preset.visible)
                {
                    if(preset.hasStaticWidth())
                    {
                        preset.resizeToWidth(preset.staticWidth);
                    }
                    else
                    {
                        preset.resizeToWidth(flexWidth);
                    }

                    const height = preset.window.height;

                    if(height > maxHeight)
                    {
                        maxHeight = height;
                    }
                }
            }

            if(this._centered)
            {
                for(const preset of this._items)
                {
                    preset.window.y = Math.trunc(maxHeight / 2 - preset.window.height / 2);
                }
            }

            this._container.width = totalWidth;
            this._container.height = maxHeight;
        }
    }

    // AS3: SimpleListViewPreset.as::set backgroundColor()
    set backgroundColor(color: number)
    {
        this._container.background = true;
        this._container.color = (0xFF000000 | color) >>> 0;
    }

    // AS3: SimpleListViewPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [...this._items];
    }

    // AS3: SimpleListViewPreset.as::hasStaticWidth()
    override hasStaticWidth(): boolean
    {
        return this._allChildrenStaticWidth;
    }

    // AS3: SimpleListViewPreset.as::get staticWidth()
    override get staticWidth(): number
    {
        if(!this._allChildrenStaticWidth)
        {
            return -1;
        }

        return this._staticWidth;
    }

    // AS3: SimpleListViewPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as IItemListWindow;
        this._items = null as unknown as WiredUIPreset[];
    }
}
