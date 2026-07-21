import type {IWindow} from '@core/window/IWindow';
import type {IScrollableListWindow} from '@core/window/components/IScrollableListWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import type {ListScrollParams} from '../params/ListScrollParams';
import type {IListPreset} from './interfaces/IListPreset';
import {WiredUIPreset} from './WiredUIPreset';

/**
 * ScrollListPreset — a vertical scrollable list of child presets, clamped between the scroll params'
 * min/max height. Reserves space for the scrollbar when visible, and re-lays out on the scrollable
 * content's WE_RESIZED.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/ScrollListPreset.as
 */
export class ScrollListPreset extends WiredUIPreset implements IListPreset
{
    // AS3: ScrollListPreset.as::SCROLLBAR_WIDTH (AS3 declares as an instance field; hoisted to static — constant)
    private static readonly SCROLLBAR_WIDTH: number = 9;

    // AS3: ScrollListPreset.as::SCROLLBAR_MARGIN (AS3 declares as an instance field; hoisted to static — constant)
    private static readonly SCROLLBAR_MARGIN: number = 3;

    // AS3: ScrollListPreset.as::_container
    private _container: IScrollableListWindow;

    // AS3: ScrollListPreset.as::_items
    private _items: WiredUIPreset[];

    // AS3: ScrollListPreset.as::_centered
    private _centered: boolean;

    // AS3: ScrollListPreset.as::_scrollParams
    private _scrollParams: ListScrollParams;

    // AS3: ScrollListPreset.as::_cachedWidth
    private _cachedWidth: number = 0;

    // AS3: ScrollListPreset.as::_ignoreListeners
    private _ignoreListeners: boolean = false;

    // AS3: ScrollListPreset.as::ScrollListPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, presets: WiredUIPreset[], scrollParams: ListScrollParams, centered: boolean = false)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._container = presetManager.createLayout('vertical_scroll_list_view') as unknown as IScrollableListWindow;
        this._centered = centered;
        this._scrollParams = scrollParams;
        this._container.spacing = wiredStyle.genericVerticalSpacing;
        this._items = [];

        for(const preset of presets)
        {
            this._items.push(preset);
            this._container.addListItem(preset.window);
        }

        this._container.limits.minHeight = scrollParams.minHeight;
        this._container.limits.maxHeight = scrollParams.maxHeight;

        if(scrollParams.alwaysShowScrollbar)
        {
            this._container.autoHideScrollBar = true;
        }

        this._container.scrollableWindow.addEventListener('WE_RESIZED', this._onScrollableWindowResized);
    }

    // AS3: ScrollListPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: ScrollListPreset.as::set spacing()
    set spacing(value: number)
    {
        this._container.spacing = value;
    }

    // AS3: ScrollListPreset.as::get spacing()
    get spacing(): number
    {
        return this._container.spacing;
    }

    // AS3: ScrollListPreset.as::resizeChildrenToWidth()
    resizeChildrenToWidth(width: number): void
    {
        // AS3 accumulates a total height here that it never reads back — preserved (dead) for fidelity.
        let _totalHeight = 0;

        _totalHeight += this._container.spacing * (this._items.length - 1);

        for(const preset of this._items)
        {
            preset.resizeToWidth(width);
            _totalHeight += preset.window.height;
        }

        if(this._centered)
        {
            for(const preset of this._items)
            {
                preset.window.x = Math.trunc(width / 2 - preset.window.width / 2);
            }
        }
    }

    // AS3: ScrollListPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        this._ignoreListeners = true;
        this._cachedWidth = width;
        super.resizeToWidth(width);

        let childWidth = width;
        let containerWidth = width;

        if(!this._scrollParams.alwaysShowScrollbar)
        {
            this.resizeChildrenToWidth(childWidth);
            this.fixHeight();
        }

        if(this._container.isScrollBarVisible)
        {
            childWidth = width - ScrollListPreset.SCROLLBAR_WIDTH - ScrollListPreset.SCROLLBAR_MARGIN;
            this.resizeChildrenToWidth(childWidth);
            containerWidth = width - ScrollListPreset.SCROLLBAR_MARGIN;
        }

        this._container.width = containerWidth;
        this.fixHeight();
        this._ignoreListeners = false;
    }

    // AS3: ScrollListPreset.as::fixHeight()
    private fixHeight(): void
    {
        this._container.height = Math.min(this._scrollParams.maxHeight, Math.max(this._scrollParams.minHeight, this._container.scrollableRegion.height));
    }

    // AS3: ScrollListPreset.as::onScrollableWindowResized()
    private _onScrollableWindowResized = (_event: WindowEvent): void =>
    {
        if(this._ignoreListeners || this.disposing)
        {
            return;
        }

        this.resizeToWidth(this._cachedWidth);
    };

    // AS3: ScrollListPreset.as::set backgroundColor()
    set backgroundColor(color: number)
    {
        this._container.background = true;
        this._container.color = (0xFF000000 | color) >>> 0;
    }

    // AS3: ScrollListPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [...this._items];
    }

    // AS3: ScrollListPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as IScrollableListWindow;
        this._items = null as unknown as WiredUIPreset[];
    }
}
