import type {IDisposable} from '@core/runtime';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';

import type {HabbiconController} from './HabbiconController';
import type {HabbiconEntryModel} from './HabbiconEntryModel';
import type {HabbiconSetModel} from './HabbiconSetModel';
import {HabbiconTileView} from './HabbiconTileView';

/**
 * One collection's worth of tiles inside the owned/favourited trays.
 *
 * **The group grows to fit its tiles.** The authored height is remembered at construction as a floor,
 * and `resizeToContent()` raises both the grid and the row to whatever the grid's scrollable region
 * turns out to need — a tray group never scrolls internally, the tray around it does.
 *
 * **Its clone carries a copy of the tile template, which is thrown away immediately.** The template
 * lives inside the group layout, so cloning the group clones it too; `removeClonedTileTemplate()`
 * disposes that copy, leaving the original — passed in from outside — untouched.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/habbicons/HabbiconCollectionTrayGroupView.as
 */
export class HabbiconCollectionTrayGroupView implements IDisposable
{
    // AS3: HabbiconCollectionTrayGroupView.as::BOTTOM_PADDING
    private static readonly BOTTOM_PADDING: number = 8;

    // AS3: HabbiconCollectionTrayGroupView.as::_window
    private _window: IWindowContainer | null;

    // AS3: HabbiconCollectionTrayGroupView.as::_SafeStr_6757 (name derived: the tile template)
    private _tileTemplate: IWindowContainer | null;

    // AS3: HabbiconCollectionTrayGroupView.as::_SafeStr_4593 (name derived: the owning controller)
    private _controller: HabbiconController | null;

    // AS3: HabbiconCollectionTrayGroupView.as::_SafeStr_7482 (name derived: the tile-click callback)
    private _onTileClicked: ((tile: HabbiconTileView) => void) | null;

    // AS3: HabbiconCollectionTrayGroupView.as::_group
    private _group: HabbiconSetModel | null = null;

    // AS3: HabbiconCollectionTrayGroupView.as::_tiles
    private _tiles: HabbiconTileView[] = [];

    // AS3: HabbiconCollectionTrayGroupView.as::_baseHeight
    private _baseHeight: number = 0;

    // AS3: HabbiconCollectionTrayGroupView.as::_SafeStr_8705 (name derived: the grid's authored height)
    private _baseGridHeight: number = 0;

    // AS3: HabbiconCollectionTrayGroupView.as::_disposed
    private _disposed: boolean = false;

    // AS3: HabbiconCollectionTrayGroupView.as::HabbiconCollectionTrayGroupView()
    constructor(
        template: IWindowContainer,
        tileTemplate: IWindowContainer | null,
        controller: HabbiconController | null,
        onTileClicked: ((tile: HabbiconTileView) => void) | null
    )
    {
        this._window = template.clone() as IWindowContainer;
        this._tileTemplate = tileTemplate;
        this._controller = controller;
        this._onTileClicked = onTileClicked;
        this._baseHeight = (this._window as unknown as IWindow).height;
        this._baseGridHeight = (this.trayGroupGrid as unknown as IWindow | null)?.height ?? 0;

        this.removeClonedTileTemplate();
    }

    // AS3: HabbiconCollectionTrayGroupView.as::initialize()
    initialize(group: HabbiconSetModel): void
    {
        this._group = group;

        this.recycleTiles();

        const title = this.trayGroupTitle;

        if(title !== null) title.text = group.title;

        if(this._window !== null) (this._window as unknown as IWindow).visible = true;

        const grid = this.trayGroupGrid;

        if(this._tileTemplate !== null && grid !== null)
        {
            for(const entry of group.habbicons)
            {
                const tile = HabbiconTileView.claim(this._tileTemplate);

                tile.initialize(this._controller, entry, this._onTileClicked);

                const window = tile.window;

                if(window !== null) grid.addGridItem(window as unknown as IWindow);

                this._tiles.push(tile);
            }
        }

        this.resizeToContent();
    }

    // AS3: HabbiconCollectionTrayGroupView.as::refreshEntry()
    refreshEntry(entry: HabbiconEntryModel | null): void
    {
        if(entry === null) return;

        for(const tile of this._tiles)
        {
            if(tile.item !== null && tile.item.habbiconId === entry.habbiconId)
            {
                tile.refresh(entry);

                return;
            }
        }
    }

    // AS3: HabbiconCollectionTrayGroupView.as::recycle()
    recycle(): void
    {
        if(this._disposed) return;

        const parent = (this._window as unknown as IWindow | null)?.parent ?? null;

        if(parent !== null && this._window !== null)
        {
            (parent as unknown as IWindowContainer).removeChild(this._window as unknown as IWindow);
        }

        this.recycleTiles();

        this._group = null;

        if(this._window !== null)
        {
            (this._window as unknown as IWindow).visible = false;
            (this._window as unknown as IWindow).height = this._baseHeight;
        }

        const grid = this.trayGroupGrid as unknown as IWindow | null;

        if(grid !== null) grid.height = this._baseGridHeight;
    }

    // AS3: HabbiconCollectionTrayGroupView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: HabbiconCollectionTrayGroupView.as::get window()
    get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: HabbiconCollectionTrayGroupView.as::get group()
    get group(): HabbiconSetModel | null
    {
        return this._group;
    }

    // AS3: HabbiconCollectionTrayGroupView.as::recycleTiles()
    private recycleTiles(): void
    {
        this.trayGroupGrid?.removeGridItems();

        for(const tile of this._tiles)
        {
            HabbiconTileView.release(tile);
        }

        this._tiles.length = 0;
    }

    /**
	 * The template's parent may be an item list or a plain container, and each removes children a
	 * different way — AS3 tries the list first and falls back.
	 */
    // AS3: HabbiconCollectionTrayGroupView.as::removeClonedTileTemplate()
    private removeClonedTileTemplate(): void
    {
        const template = this.trayTileTemplate;

        if(template === null) return;

        const parent = template.parent ?? null;
        const list = parent as unknown as IItemListWindow | null;

        if(list !== null && typeof list.removeListItem === 'function')
        {
            list.removeListItem(template);
        }
        else if(parent !== null)
        {
            (parent as unknown as IWindowContainer).removeChild(template);
        }

        template.dispose();
    }

    // AS3: HabbiconCollectionTrayGroupView.as::resizeToContent()
    private resizeToContent(): void
    {
        const grid = this.trayGroupGrid;
        const gridWindow = grid as unknown as IWindow | null;

        if(grid === null || gridWindow === null || this._window === null) return;

        gridWindow.height = Math.max(this._baseGridHeight, grid.scrollableRegion.height);

        (this._window as unknown as IWindow).height = Math.max(
            this._baseHeight,
            gridWindow.y + gridWindow.height + HabbiconCollectionTrayGroupView.BOTTOM_PADDING
        );

        (this._window as unknown as IWindow).invalidate();
    }

    // AS3: HabbiconCollectionTrayGroupView.as::get trayGroupTitle()
    private get trayGroupTitle(): ITextWindow | null
    {
        return (this._window?.findChildByName('tray_group_title') as ITextWindow | null) ?? null;
    }

    // AS3: HabbiconCollectionTrayGroupView.as::get trayGroupGrid()
    private get trayGroupGrid(): IItemGridWindow | null
    {
        return (this._window?.findChildByName('tray_group_grid') as IItemGridWindow | null) ?? null;
    }

    // AS3: HabbiconCollectionTrayGroupView.as::get trayTileTemplate()
    private get trayTileTemplate(): IWindow | null
    {
        return this.trayGroupGrid?.getGridItemByName('tray_tile_template') ?? null;
    }

    // AS3: HabbiconCollectionTrayGroupView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.recycle();

        (this._window as unknown as IWindow | null)?.dispose();
        this._window = null;
        this._tileTemplate = null;
        this._controller = null;
        this._onTileClicked = null;
        this._group = null;
        this._tiles = [];
        this._disposed = true;
    }
}
