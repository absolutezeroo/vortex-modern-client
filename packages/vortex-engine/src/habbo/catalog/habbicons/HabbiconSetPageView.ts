import type {IDisposable} from '@core/runtime';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';

import type {HabbiconController} from './HabbiconController';
import type {HabbiconEntryModel} from './HabbiconEntryModel';
import type {HabbiconSetModel} from './HabbiconSetModel';
import {HabbiconProgressBarView} from './HabbiconProgressBarView';
import {HabbiconRewardPanelView} from './HabbiconRewardPanelView';
import {HabbiconTileView} from './HabbiconTileView';

/**
 * The right-hand page: one collection's habbicons in a grid, its progress, and its reward panel.
 *
 * **The grid is always padded to twenty slots.** Empty clones fill whatever the set does not use, so
 * a four-habbicon collection occupies the same rectangle as a full one. Those clones are disposed on
 * every refresh — unlike the tiles, which are pooled.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/habbicons/HabbiconSetPageView.as
 */
export class HabbiconSetPageView implements IDisposable
{
    // AS3: HabbiconSetPageView.as::VISIBLE_SLOT_COUNT
    private static readonly VISIBLE_SLOT_COUNT: number = 20;

    // AS3: HabbiconSetPageView.as::_SafeStr_4593 (name derived: the owning controller)
    private _controller: HabbiconController | null;

    // AS3: HabbiconSetPageView.as::_window
    private _window: IWindowContainer | null;

    // AS3: HabbiconSetPageView.as::_SafeStr_6757 (name derived: the tile template)
    private _tileTemplate: IWindowContainer | null;

    // AS3: HabbiconSetPageView.as::_emptyTileTemplate
    private _emptyTileTemplate: IWindowContainer | null;

    // AS3: HabbiconSetPageView.as::_SafeStr_7482 (name derived: the tile-click callback)
    private _onTileClicked: ((tile: HabbiconTileView) => void) | null;

    // AS3: HabbiconSetPageView.as::_SafeStr_4833 (name derived: the set on show)
    private _set: HabbiconSetModel | null = null;

    // AS3: HabbiconSetPageView.as::_progressView
    private _progressView: HabbiconProgressBarView | null;

    // AS3: HabbiconSetPageView.as::_SafeStr_5737 (name derived: the reward panel)
    private _rewardPanel: HabbiconRewardPanelView | null;

    // AS3: HabbiconSetPageView.as::_tiles
    private _tiles: HabbiconTileView[] = [];

    // AS3: HabbiconSetPageView.as::_emptySlots
    private _emptySlots: IWindowContainer[] = [];

    // AS3: HabbiconSetPageView.as::_disposed
    private _disposed: boolean = false;

    // AS3: HabbiconSetPageView.as::HabbiconSetPageView()
    constructor(
        controller: HabbiconController | null,
        window: IWindowContainer | null,
        tileTemplate: IWindowContainer | null,
        emptyTileTemplate: IWindowContainer | null,
        onTileClicked: ((tile: HabbiconTileView) => void) | null
    )
    {
        this._controller = controller;
        this._window = window;
        this._tileTemplate = tileTemplate;
        this._emptyTileTemplate = emptyTileTemplate;
        this._onTileClicked = onTileClicked;
        this._progressView = new HabbiconProgressBarView(this.setProgressBar);
        this._rewardPanel = new HabbiconRewardPanelView(controller, window, onTileClicked);
    }

    // AS3: HabbiconSetPageView.as::refresh()
    refresh(set: HabbiconSetModel | null, animate: boolean): void
    {
        this._set = set;

        this.recycleTiles();

        const title = this.setTitle;
        const description = this.setDescription;
        const progressText = this.setProgressText;

        if(set === null)
        {
            if(this._window !== null) (this._window as unknown as IWindow).visible = false;
            if(title !== null) title.text = '';
            if(description !== null) description.text = '';

            this._progressView?.setRatio(0, false);

            if(progressText !== null) progressText.text = '';

            this._rewardPanel?.refresh(null, false);

            return;
        }

        if(this._window !== null) (this._window as unknown as IWindow).visible = true;
        if(title !== null) title.text = set.title;
        if(description !== null) description.text = set.description;

        this._progressView?.setRatio(set.progressRatio, animate);

        if(progressText !== null) progressText.text = this.formatProgress(set);

        const grid = this.setGrid;

        if(this._tileTemplate !== null && grid !== null)
        {
            for(const entry of set.habbicons)
            {
                const tile = HabbiconTileView.claim(this._tileTemplate);

                tile.initialize(this._controller, entry, this._onTileClicked);

                const window = tile.window;

                if(window !== null) grid.addGridItem(window as unknown as IWindow);

                this._tiles.push(tile);
            }
        }

        this.addEmptySlots(this._tiles.length);
        this._rewardPanel?.refresh(set, animate);
    }

    // AS3: HabbiconSetPageView.as::refreshEntry()
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

    // AS3: HabbiconSetPageView.as::refreshProgress()
    refreshProgress(set: HabbiconSetModel | null, animate: boolean): void
    {
        this._set = set;

        const progressText = this.setProgressText;

        if(set === null)
        {
            this._progressView?.setRatio(0, false);

            if(progressText !== null) progressText.text = '';

            return;
        }

        this._progressView?.setRatio(set.progressRatio, animate);

        if(progressText !== null) progressText.text = this.formatProgress(set);
    }

    // AS3: HabbiconSetPageView.as::refreshReward()
    refreshReward(set: HabbiconSetModel | null, animate: boolean): void
    {
        this._rewardPanel?.refresh(set, animate);
    }

    // AS3: HabbiconSetPageView.as::update()
    update(delta: number): void
    {
        this._progressView?.update(delta);
        this._rewardPanel?.update(delta);
    }

    // AS3: HabbiconSetPageView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // TS-only: AS3 inlines this call twice; extracted so the key and its two parameters live once.
    private formatProgress(set: HabbiconSetModel): string
    {
        return this._controller?.localizationManager?.getLocalizationWithParams(
            'habbicon_book.set_progress.count',
            '',
            'collected', String(set.completed),
            'total', String(set.total)
        ) ?? '';
    }

    // AS3: HabbiconSetPageView.as::recycleTiles()
    private recycleTiles(): void
    {
        this.setGrid?.removeGridItems();

        for(const tile of this._tiles)
        {
            HabbiconTileView.release(tile);
        }

        this._tiles.length = 0;

        for(const slot of this._emptySlots)
        {
            (slot as unknown as IWindow).dispose();
        }

        this._emptySlots.length = 0;
    }

    // AS3: HabbiconSetPageView.as::addEmptySlots()
    private addEmptySlots(used: number): void
    {
        const grid = this.setGrid;

        if(this._emptyTileTemplate === null || grid === null) return;

        const count = Math.max(0, HabbiconSetPageView.VISIBLE_SLOT_COUNT - used);

        for(let i = 0; i < count; i++)
        {
            const slot = this._emptyTileTemplate.clone() as IWindowContainer;

            (slot as unknown as IWindow).visible = true;
            grid.addGridItem(slot as unknown as IWindow);
            this._emptySlots.push(slot);
        }
    }

    // AS3: HabbiconSetPageView.as::get setTitle()
    private get setTitle(): ITextWindow | null
    {
        return (this._window?.findChildByName('set_title') as ITextWindow | null) ?? null;
    }

    // AS3: HabbiconSetPageView.as::get setDescription()
    private get setDescription(): ITextWindow | null
    {
        return (this._window?.findChildByName('set_description') as ITextWindow | null) ?? null;
    }

    // AS3: HabbiconSetPageView.as::get setProgressBar()
    private get setProgressBar(): IWindowContainer | null
    {
        return (this._window?.findChildByName('set_progress_bar') as IWindowContainer | null) ?? null;
    }

    // AS3: HabbiconSetPageView.as::get setProgressText()
    private get setProgressText(): ITextWindow | null
    {
        return (this._window?.findChildByName('set_progress_text') as ITextWindow | null) ?? null;
    }

    // AS3: HabbiconSetPageView.as::get setGrid()
    private get setGrid(): IItemGridWindow | null
    {
        return (this._window?.findChildByName('set_grid') as IItemGridWindow | null) ?? null;
    }

    // AS3: HabbiconSetPageView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.recycleTiles();

        if(this._progressView !== null)
        {
            this._progressView.dispose();
            this._progressView = null;
        }

        if(this._rewardPanel !== null)
        {
            this._rewardPanel.dispose();
            this._rewardPanel = null;
        }

        this._controller = null;
        this._window = null;
        this._tileTemplate = null;
        this._emptyTileTemplate = null;
        this._onTileClicked = null;
        this._set = null;
        this._tiles = [];
        this._emptySlots = [];
        this._disposed = true;
    }
}
