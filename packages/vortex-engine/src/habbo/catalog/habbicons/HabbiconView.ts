import type {IDisposable} from '@core/runtime';
import type {IUpdateReceiver} from '@core/runtime/IContext';
import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import {HabbiconAssetManager} from '@habbo/habbicons/assets/HabbiconAssetManager';
import type {
    HabbiconCollectionData
} from '@habbo/communication/messages/incoming/habbicons/HabbiconCollectionData';
import type {
    HabbiconShopItemData
} from '@habbo/communication/messages/incoming/habbicons/HabbiconShopItemData';

import type {HabbiconController} from './HabbiconController';
import {HabbiconControllerEvent} from './HabbiconControllerEvent';
import {HabbiconAlbumModel} from './HabbiconAlbumModel';
import {HabbiconAlbumStats} from './HabbiconAlbumStats';
import {HabbiconEntryModel} from './HabbiconEntryModel';
import {HabbiconSetModel} from './HabbiconSetModel';
import {HabbiconState} from './HabbiconState';
import {HabbiconTabMode} from './HabbiconTabMode';
import {HabbiconAlbumHeaderView} from './HabbiconAlbumHeaderView';
import {HabbiconTabView} from './HabbiconTabView';
import {HabbiconSetRailView} from './HabbiconSetRailView';
import {HabbiconSetPageView} from './HabbiconSetPageView';
import {HabbiconCollectionTrayView} from './HabbiconCollectionTrayView';
import {HabbiconPopupController} from './HabbiconPopupController';
import type {HabbiconTileView} from './HabbiconTileView';

const log = Logger.getLogger('habbo.catalog.habbicons.HabbiconView');

/**
 * The habbicon hub window: three tabs over a collection rail, a set page, and two trays.
 *
 * **The album is rebuilt from the controller's caches on every change, not mutated.** The controller
 * holds wire DTOs; this view flattens them into models the widgets can read, and there is no path
 * that edits an existing album in place — `refreshChangedHabbicon()` builds a whole new one and then
 * copies the affected set's fields across, keeping the *object identity* the rail rows are holding.
 * That is what lets one habbicon change without every row being torn down.
 *
 * **Four templates are pulled out of the layout at construction and never returned.** The tile, empty
 * tile, tray group and tray tile all live inside the layout as prototypes; extracting them is what
 * makes the grids start empty, and `dispose()` is the only thing that frees them.
 *
 * **Progress only animates while the window is on screen.** `shouldAnimateProgress()` gates both the
 * per-frame update and every `animate` flag passed downward, so a hub updated in the background snaps
 * to its new values and never plays a bar animation nobody saw.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/habbicons/HabbiconView.as
 */
export class HabbiconView implements IDisposable, IUpdateReceiver
{
    // AS3: HabbiconView.as::DESKTOP_WINDOW_LAYER
    private static readonly DESKTOP_WINDOW_LAYER: number = 1;

    /**
	 * Six pastels cycled by a hash of the habbicon and collection ids. Nothing in the ported widgets
	 * reads `HabbiconEntryModel.color` — it is written and never used, in AS3 too.
	 */
    // AS3: HabbiconView.as::seededColor() — the inline palette (name derived)
    private static readonly SEEDED_COLORS: readonly number[] = [
        16371247, 15964719, 15695663, 9358143, 5095656, 12813557,
    ];

    // AS3: HabbiconView.as::_SafeStr_4593 (name derived: the owning controller)
    private _controller: HabbiconController | null;

    // AS3: HabbiconView.as::_windowManager
    private _windowManager: IHabboWindowManager | null;

    // AS3: HabbiconView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: HabbiconView.as::_headerView
    private _headerView: HabbiconAlbumHeaderView | null = null;

    // AS3: HabbiconView.as::_SafeStr_6487 (name derived: the tab strip)
    private _tabView: HabbiconTabView | null = null;

    // AS3: HabbiconView.as::_SafeStr_5326 (name derived: the collection rail)
    private _setRailView: HabbiconSetRailView | null = null;

    // AS3: HabbiconView.as::_SafeStr_5076 (name derived: the set page)
    private _setPageView: HabbiconSetPageView | null = null;

    // AS3: HabbiconView.as::_SafeStr_5757 (name derived: the owned/favourited tray)
    private _trayView: HabbiconCollectionTrayView | null = null;

    // AS3: HabbiconView.as::_SafeStr_4760 (name derived: the tile popup)
    private _popupController: HabbiconPopupController | null = null;

    // AS3: HabbiconView.as::_SafeStr_6757 (name derived: the tile template)
    private _tileTemplate: IWindowContainer | null = null;

    // AS3: HabbiconView.as::_emptyTileTemplate
    private _emptyTileTemplate: IWindowContainer | null = null;

    // AS3: HabbiconView.as::_SafeStr_6629 (name derived: the tray group template)
    private _trayGroupTemplate: IWindowContainer | null = null;

    // AS3: HabbiconView.as::_SafeStr_7178 (name derived: the tray tile template)
    private _trayTileTemplate: IWindowContainer | null = null;

    // AS3: HabbiconView.as::_SafeStr_4666 (name derived: the album on screen)
    private _album: HabbiconAlbumModel | null = null;

    // AS3: HabbiconView.as::_SafeStr_5409 (name derived: the selected tab)
    private _activeTab: string = HabbiconTabMode.ALL_SETS;

    // AS3: HabbiconView.as::_SafeStr_4682 (name derived: the selected set)
    private _activeSet: HabbiconSetModel | null = null;

    // AS3: HabbiconView.as::_SafeStr_5012 (name derived: the tile the popup is open on)
    private _activeTile: HabbiconTileView | null = null;

    // AS3: HabbiconView.as::_SafeStr_9822 (name derived: the first show has happened)
    private _hasShown: boolean = false;

    // AS3: HabbiconView.as::_disposed
    private _disposed: boolean = false;

    // AS3: HabbiconView.as::HabbiconView()
    constructor(controller: HabbiconController, windowManager: IHabboWindowManager | null)
    {
        this._controller = controller;
        this._windowManager = windowManager;

        const asset = (controller.assets?.getAssetByName('habbicon_view_xml') as XmlAsset | null) ?? null;
        const layout = asset?.content ?? null;

        if(layout === null || windowManager === null)
        {
            log.warn('Missing layout "habbicon_view_xml" — the habbicon hub is not built');

            return;
        }

        this._window = windowManager.buildFromXML(
            layout, HabbiconView.DESKTOP_WINDOW_LAYER
        ) as IWindowContainer | null;

        if(this._window === null) return;

        (this._window as unknown as IWindow).center();

        this.extractTemplates();
        this.createChildViews();
        this.addEventListeners();

        controller.registerUpdateReceiver(this, 1);

        this.refreshWholeAlbum(false);
    }

    /**
	 * The tray tile template is fetched *before* the tray group template leaves the list, because it
	 * lives inside it — and it is only read, not removed, so every group clone still carries a copy
	 * for `HabbiconCollectionTrayGroupView` to discard.
	 */
    // AS3: HabbiconView.as::extractTemplates()
    private extractTemplates(): void
    {
        const grid = this.setGrid;

        if(grid !== null)
        {
            this._tileTemplate = (grid.getGridItemByName('tile_template') as unknown as IWindowContainer | null) ?? null;

            if(this._tileTemplate !== null) grid.removeGridItem(this._tileTemplate as unknown as IWindow);

            this._emptyTileTemplate =
                (grid.getGridItemByName('empty_tile_template') as unknown as IWindowContainer | null) ?? null;

            if(this._emptyTileTemplate !== null) grid.removeGridItem(this._emptyTileTemplate as unknown as IWindow);
        }

        const list = this.trayGroupList;

        if(list === null) return;

        this._trayGroupTemplate =
            (list.getListItemByName('tray_group_template') as unknown as IWindowContainer | null) ?? null;

        const groupGrid = (this._trayGroupTemplate?.findChildByName('tray_group_grid') as IItemGridWindow | null) ?? null;

        this._trayTileTemplate =
            (groupGrid?.getGridItemByName('tray_tile_template') as unknown as IWindowContainer | null) ?? null;
    }

    // AS3: HabbiconView.as::createChildViews()
    private createChildViews(): void
    {
        if(this._controller === null) return;

        this._headerView = new HabbiconAlbumHeaderView(this._controller, this.albumHeader);
        this._tabView = new HabbiconTabView(this._window, this.onTabChanged);
        this._setRailView = new HabbiconSetRailView(this.allSetsContainer, this.onSetSelected);
        this._setPageView = new HabbiconSetPageView(
            this._controller, this.setPageContainer, this._tileTemplate, this._emptyTileTemplate, this.onTileClicked
        );
        this._trayView = new HabbiconCollectionTrayView(
            this._controller, this.trayContainer, this._trayGroupTemplate, this._trayTileTemplate, this.onTileClicked
        );
        this._popupController = new HabbiconPopupController(
            this._window,
            this.onPopupActionClicked,
            this.onPopupBuyClicked,
            this.onPopupHidden,
            this.isPointInsideAnyTile,
            this._controller.configuration,
            this._controller.localizationManager
        );
    }

    // AS3: HabbiconView.as::addEventListeners()
    private addEventListeners(): void
    {
        this.headerButtonClose?.addEventListener('WME_CLICK', this.onWindowClose);

        this._controller?.addEventListener(HabbiconControllerEvent.HABBICON_STATUS_CHANGED, this.onControllerDataUpdated);
        this._controller?.addEventListener(HabbiconControllerEvent.OWNED_HABBICONS_UPDATED, this.onControllerDataUpdated);
        this._controller?.addEventListener(HabbiconControllerEvent.SHOP_DATA_UPDATED, this.onControllerDataUpdated);
    }

    // AS3: HabbiconView.as::removeEventListeners()
    private removeEventListeners(): void
    {
        if(this._window !== null) this.headerButtonClose?.removeEventListener('WME_CLICK', this.onWindowClose);

        this._controller?.removeEventListener(HabbiconControllerEvent.HABBICON_STATUS_CHANGED, this.onControllerDataUpdated);
        this._controller?.removeEventListener(HabbiconControllerEvent.OWNED_HABBICONS_UPDATED, this.onControllerDataUpdated);
        this._controller?.removeEventListener(HabbiconControllerEvent.SHOP_DATA_UPDATED, this.onControllerDataUpdated);
    }

    /**
	 * An event naming a habbicon takes the surgical path; anything else either builds the first album
	 * or just re-reads progress.
	 */
    // AS3: HabbiconView.as::onControllerDataUpdated()
    private onControllerDataUpdated = (event: HabbiconControllerEvent): void =>
    {
        if(event.habbiconId > 0)
        {
            this.refreshChangedHabbicon(event.habbiconId, event.collectionId, this.shouldAnimateProgress());

            return;
        }

        if(event.type !== HabbiconControllerEvent.OWNED_HABBICONS_UPDATED
            && event.type !== HabbiconControllerEvent.SHOP_DATA_UPDATED)
        {
            return;
        }

        if(this._album === null || this._album.sets.length === 0)
        {
            this.refreshWholeAlbum(true);
        }
        else
        {
            this.refreshProgressFromController(this.shouldAnimateProgress());
        }
    };

    /**
	 * `keepSelection` carries the *collection id*, not the object — the rebuild produces new models,
	 * so identity cannot survive it.
	 */
    // AS3: HabbiconView.as::rebuildAlbum()
    private rebuildAlbum(keepSelection: boolean): void
    {
        const selectedId = keepSelection && this._activeSet !== null ? this._activeSet.collectionId : 0;

        this._album = this.buildAlbumFromController();
        this._activeSet = selectedId > 0 ? this._album.findSetByCollectionId(selectedId) : null;

        if(this._activeSet === null && this._album.sets.length > 0)
        {
            this._activeSet = this._album.sets[0];
        }
    }

    // AS3: HabbiconView.as::refreshWholeAlbum()
    private refreshWholeAlbum(keepSelection: boolean): void
    {
        this.hidePopupAndClearActiveTile();
        this.rebuildAlbum(keepSelection);

        if(this._album === null) return;

        this._headerView?.refresh(this._album.stats, false);
        this._setRailView?.setSets(this._album.sets);
        this._setRailView?.setActiveSet(this._activeSet);

        this.refreshActiveTabContent();
    }

    /**
	 * The popup is re-shown for the same tile after the refresh, but only if it was open on *this*
	 * habbicon — which is why the id is captured before anything is rebuilt.
	 */
    // AS3: HabbiconView.as::refreshChangedHabbicon()
    private refreshChangedHabbicon(habbiconId: number, collectionId: number, animate: boolean): void
    {
        const animateRail = animate && this._activeTab === HabbiconTabMode.ALL_SETS;
        const popupWasOpen = (this._popupController?.visible ?? false)
            && (this._popupController?.activeTile?.item ?? null) !== null;
        const popupHabbiconId = popupWasOpen ? (this._popupController?.activeTile?.item?.habbiconId ?? 0) : 0;

        const rebuilt = this.buildAlbumFromController();
        const entry = rebuilt.findEntryByHabbiconId(habbiconId);

        let rebuiltSet = collectionId > 0 ? rebuilt.findSetByCollectionId(collectionId) : null;

        if(rebuiltSet === null && entry !== null) rebuiltSet = rebuilt.findSetByCollectionId(entry.collectionId);

        if(this._album === null || rebuiltSet === null)
        {
            this.refreshWholeAlbum(true);

            return;
        }

        const liveSet = this._album.findSetByCollectionId(rebuiltSet.collectionId);

        if(liveSet === null)
        {
            this.refreshWholeAlbum(true);

            return;
        }

        this._album.stats = rebuilt.stats;
        this._album.ownedGroups = rebuilt.ownedGroups;
        this._album.favouriteGroups = rebuilt.favouriteGroups;

        HabbiconView.copySetState(liveSet, rebuiltSet);

        this._headerView?.refresh(this._album.stats, animate);
        this._setRailView?.setActiveSet(this._activeSet);
        this._setRailView?.refreshSet(liveSet, animateRail);

        if(this._activeTab === HabbiconTabMode.ALL_SETS)
        {
            this.refreshActiveSetChange(liveSet, entry, animateRail);

            if(popupWasOpen
                && popupHabbiconId === habbiconId
                && (this._popupController?.activeTile?.item ?? null) !== null)
            {
                this._popupController?.showForTile(this._popupController.activeTile);
            }

            return;
        }

        this.hidePopupAndClearActiveTile();
        this.refreshActiveTabContent();
    }

    /**
	 * The header is only re-rendered when its numbers actually moved — otherwise its progress bar
	 * would restart its animation on every unrelated update. The stats object is replaced either way.
	 */
    // AS3: HabbiconView.as::refreshProgressFromController()
    private refreshProgressFromController(animate: boolean): void
    {
        if(this._album === null) return;

        const rebuilt = this.buildAlbumFromController();
        const animateRail = animate && this._activeTab === HabbiconTabMode.ALL_SETS;

        if(rebuilt.sets.length === 0) return;

        if(HabbiconView.albumStatsChanged(this._album.stats, rebuilt.stats))
        {
            this._album.stats = rebuilt.stats;
            this._headerView?.refresh(this._album.stats, animate);
        }
        else
        {
            this._album.stats = rebuilt.stats;
        }

        this._album.ownedGroups = rebuilt.ownedGroups;
        this._album.favouriteGroups = rebuilt.favouriteGroups;

        for(const rebuiltSet of rebuilt.sets)
        {
            const liveSet = this._album.findSetByCollectionId(rebuiltSet.collectionId);

            if(liveSet === null) continue;

            const progressChanged = liveSet.completed !== rebuiltSet.completed || liveSet.total !== rebuiltSet.total;
            const rewardChanged = HabbiconView.setRewardPanelChanged(liveSet, rebuiltSet);
            const isActive = this._activeSet !== null && this._activeSet.collectionId === liveSet.collectionId;

            HabbiconView.copySetState(liveSet, rebuiltSet);

            if(progressChanged)
            {
                this._setRailView?.refreshSet(liveSet, animateRail);

                if(isActive) this._setPageView?.refreshProgress(this._activeSet, animateRail);
            }

            if((progressChanged || rewardChanged) && isActive)
            {
                this._setPageView?.refreshReward(this._activeSet, animateRail);
            }
        }
    }

    // AS3: HabbiconView.as::albumStatsChanged()
    private static albumStatsChanged(before: HabbiconAlbumStats | null, after: HabbiconAlbumStats | null): boolean
    {
        return before === null
            || after === null
            || before.ownedHabbicons !== after.ownedHabbicons
            || before.completedSets !== after.completedSets
            || before.collected !== after.collected
            || before.total !== after.total;
    }

    // AS3: HabbiconView.as::setRewardPanelChanged()
    private static setRewardPanelChanged(before: HabbiconSetModel | null, after: HabbiconSetModel | null): boolean
    {
        return before === null
            || after === null
            || before.canBuy !== after.canBuy
            || before.priceCredits !== after.priceCredits
            || before.priceActivityPoints !== after.priceActivityPoints
            || before.activityPointType !== after.activityPointType
            || HabbiconView.rewardHabbiconChanged(before.rewardHabbicon, after.rewardHabbicon);
    }

    // AS3: HabbiconView.as::rewardHabbiconChanged()
    private static rewardHabbiconChanged(
        before: HabbiconEntryModel | null, after: HabbiconEntryModel | null
    ): boolean
    {
        if(before === null || after === null) return before !== after;

        return before.habbiconId !== after.habbiconId
            || before.state !== after.state
            || before.owned !== after.owned
            || before.favorite !== after.favorite
            || before.claimable !== after.claimable;
    }

    /**
	 * Field-by-field, on purpose: the target object stays the one the rail row and set page are
	 * holding, so neither has to be rebuilt.
	 */
    // AS3: HabbiconView.as::copySetState()
    private static copySetState(target: HabbiconSetModel, source: HabbiconSetModel): void
    {
        target.id = source.id;
        target.collectionId = source.collectionId;
        target.name = source.name;
        target.title = source.title;
        target.description = source.description;
        target.bitmap = source.bitmap;
        target.habbicons = source.habbicons;
        target.rewardHabbicon = source.rewardHabbicon;
        target.completed = source.completed;
        target.total = source.total;
        target.priceCredits = source.priceCredits;
        target.priceActivityPoints = source.priceActivityPoints;
        target.activityPointType = source.activityPointType;
        target.canBuy = source.canBuy;
    }

    // AS3: HabbiconView.as::refreshActiveSetChange()
    private refreshActiveSetChange(
        set: HabbiconSetModel | null, entry: HabbiconEntryModel | null, animate: boolean
    ): void
    {
        if(this._activeSet === null || set === null || this._activeSet.collectionId !== set.collectionId) return;

        this._setPageView?.refreshProgress(this._activeSet, animate);
        this._setPageView?.refreshReward(this._activeSet, animate);

        if(entry !== null && !entry.isReward) this._setPageView?.refreshEntry(entry);
    }

    // AS3: HabbiconView.as::refreshActiveTabContent()
    private refreshActiveTabContent(): void
    {
        if(this._album === null) return;

        const allSets = this.allSetsContainer as unknown as IWindow | null;
        const tray = this.trayContainer as unknown as IWindow | null;

        if(this._activeTab === HabbiconTabMode.ALL_SETS)
        {
            if(allSets !== null) allSets.visible = true;
            if(tray !== null) tray.visible = false;

            this._setPageView?.refresh(this._activeSet, false);
        }
        else if(this._activeTab === HabbiconTabMode.OWNED)
        {
            if(allSets !== null) allSets.visible = false;
            if(tray !== null) tray.visible = true;

            this._trayView?.refresh(this._activeTab, this._album.ownedGroups);
        }
        else if(this._activeTab === HabbiconTabMode.FAVOURITED)
        {
            if(allSets !== null) allSets.visible = false;
            if(tray !== null) tray.visible = true;

            this._trayView?.refresh(this._activeTab, this._album.favouriteGroups);
        }
    }

    // AS3: HabbiconView.as::selectSet()
    private selectSet(set: HabbiconSetModel): void
    {
        this._activeSet = set;

        this.hidePopupAndClearActiveTile();
        this._setRailView?.setActiveSet(this._activeSet);

        if(this._activeTab === HabbiconTabMode.ALL_SETS) this._setPageView?.refresh(this._activeSet, false);
    }

    // AS3: HabbiconView.as::onTabChanged()
    private onTabChanged = (mode: string): void =>
    {
        this._activeTab = mode;

        this.hidePopupAndClearActiveTile();

        const allSets = this.allSetsContainer as unknown as IWindow | null;
        const tray = this.trayContainer as unknown as IWindow | null;

        if(allSets !== null) allSets.visible = mode === HabbiconTabMode.ALL_SETS;
        if(tray !== null) tray.visible = mode !== HabbiconTabMode.ALL_SETS;

        if(mode === HabbiconTabMode.OWNED)
        {
            this._trayView?.refresh(mode, this._album?.ownedGroups ?? null);
        }
        else if(mode === HabbiconTabMode.FAVOURITED)
        {
            this._trayView?.refresh(mode, this._album?.favouriteGroups ?? null);
        }
        else
        {
            this._setPageView?.refresh(this._activeSet, false);
        }
    };

    // AS3: HabbiconView.as::onSetSelected()
    private onSetSelected = (set: HabbiconSetModel): void =>
    {
        this.selectSet(set);
    };

    /**
	 * Clicking a habbicon the player does not hold asks the server for its current row first — the
	 * cached shop data can be minutes old, and the popup is about to quote a price from it.
	 */
    // AS3: HabbiconView.as::onTileClicked()
    private onTileClicked = (tile: HabbiconTileView | null): void =>
    {
        if(tile === null || tile.item === null) return;

        if(this._activeTile !== null && this._activeTile !== tile) this._activeTile.setActive(false);

        this._activeTile = tile;
        this._activeTile.setActive(true);

        if(!tile.item.isReward && !tile.item.owned && !tile.item.claimable)
        {
            this._controller?.getHabbiconInfo(tile.item.habbiconId);
        }

        this._popupController?.showForTile(tile);
    };

    /**
	 * Each action re-tests the flag it depends on: the popup's mode was decided when it opened, and a
	 * status message could have changed the habbicon since.
	 */
    // AS3: HabbiconView.as::onPopupActionClicked()
    private onPopupActionClicked = (tile: HabbiconTileView | null, mode: string): void =>
    {
        if(tile === null || tile.item === null) return;

        switch(mode)
        {
            case 'claim':
                if(tile.item.claimable) this._controller?.claimHabbicon(tile.item.habbiconId);
                break;
            case 'add_favorite':
                if(tile.item.owned) this._controller?.favoriteHabbicon(tile.item.habbiconId);
                break;
            case 'remove_favorite':
                if(tile.item.favorite) this._controller?.unfavoriteHabbicon(tile.item.habbiconId);
                break;
        }
    };

    // AS3: HabbiconView.as::onPopupBuyClicked()
    private onPopupBuyClicked = (tile: HabbiconTileView | null): void =>
    {
        if(tile === null || tile.item === null) return;

        if(tile.item.purchasable && HabbiconView.hasHabbiconPrice(tile.item))
        {
            this._controller?.openHabbiconPurchaseConfirmation(tile.item);
            this.hidePopupAndClearActiveTile();
        }
    };

    // AS3: HabbiconView.as::onPopupHidden()
    private onPopupHidden = (): void =>
    {
        this.clearActiveTile();
    };

    // AS3: HabbiconView.as::hidePopupAndClearActiveTile()
    private hidePopupAndClearActiveTile(): void
    {
        this._popupController?.hide(false);
        this.clearActiveTile();
    }

    // AS3: HabbiconView.as::clearActiveTile()
    private clearActiveTile(): void
    {
        if(this._activeTile === null) return;

        this._activeTile.setActive(false);
        this._activeTile = null;
    }

    // AS3: HabbiconView.as::buildAlbumFromController()
    private buildAlbumFromController(): HabbiconAlbumModel
    {
        const album = new HabbiconAlbumModel();
        const collections = this._controller?.shopCollections ?? [];

        if(collections.length === 0) return album;

        for(const collection of collections)
        {
            if(collection === null) continue;

            const set = new HabbiconSetModel();

            set.collectionId = collection.collectionId;
            set.id = `collection_${collection.collectionId}`;
            set.name = collection.name;
            set.title = this.resolveCollectionTitle(collection);
            set.description = this.resolveCollectionDescription(collection);
            set.priceCredits = collection.priceCredits;
            set.priceActivityPoints = collection.priceActivityPoints;
            set.activityPointType = collection.activityPointType;
            set.bitmap = HabbiconAssetManager.getCollectionIconBitmap(collection.collectionId);

            for(const item of collection.habbicons)
            {
                const entry = this.createEntryFromData(item, set);

                if(entry !== null) set.habbicons.push(entry);
            }

            set.rewardHabbicon = this.createRewardEntry(collection, set);
            set.canBuy = (collection.priceCredits > 0 || collection.priceActivityPoints > 0) && !collection.completed;

            HabbiconView.updateSetProgress(set);

            album.sets.push(set);
        }

        HabbiconView.updateAlbumStats(album);

        album.ownedGroups = HabbiconView.createTrayGroups(album, false);
        album.favouriteGroups = HabbiconView.createFavouriteTrayGroups(album);

        return album;
    }

    /**
	 * `index` is the *current* length of the set's list — so it is the slot this entry is about to
	 * take. Nothing in the ported widgets reads it, in AS3 either.
	 *
	 * The description is a hardcoded English string in AS3, not a localization key. Transcribed.
	 */
    // AS3: HabbiconView.as::createEntryFromData()
    private createEntryFromData(item: HabbiconShopItemData | null, set: HabbiconSetModel): HabbiconEntryModel | null
    {
        if(item === null) return null;

        const entry = new HabbiconEntryModel();

        entry.id = String(item.habbiconId);
        entry.habbiconId = item.habbiconId;
        entry.collectionId = item.collectionId;
        entry.collectionName = set.name;
        entry.collectionTitle = set.title;
        entry.name = this.resolveHabbiconDisplayName(item.habbiconId, item.name);
        entry.description = 'Server-driven habbicon state and price.';
        entry.index = set.habbicons.length;
        entry.state = item.state;
        entry.favorite = entry.state === HabbiconState.FAVOURITED;
        entry.owned = entry.favorite || entry.state === HabbiconState.OWNED;
        entry.claimable = entry.state === HabbiconState.CLAIMABLE;
        entry.isReward = false;
        entry.priceCredits = item.priceCredits;
        entry.priceActivityPoints = item.priceActivityPoints;
        entry.activityPointType = item.activityPointType;
        entry.purchasable = entry.state === HabbiconState.AVAILABLE && HabbiconView.hasHabbiconPrice(entry);
        entry.color = HabbiconView.seededColor(entry.habbiconId * 37 + entry.collectionId * 11);

        return entry;
    }

    /**
	 * A reward is never purchasable on its own — the whole set is bought instead — so its prices are
	 * zeroed even though the collection carries them.
	 */
    // AS3: HabbiconView.as::createRewardEntry()
    private createRewardEntry(collection: HabbiconCollectionData, set: HabbiconSetModel): HabbiconEntryModel | null
    {
        if(collection.rewardHabbiconId <= 0) return null;

        const state = collection.rewardState;
        const entry = new HabbiconEntryModel();

        entry.id = `reward_${collection.rewardHabbiconId}`;
        entry.habbiconId = collection.rewardHabbiconId;
        entry.collectionId = collection.collectionId;
        entry.collectionName = set.name;
        entry.collectionTitle = set.title;
        entry.name = this.resolveHabbiconDisplayName(collection.rewardHabbiconId);
        entry.description = 'Collection reward habbicon.';
        entry.index = set.habbicons.length;
        entry.state = state;
        entry.favorite = state === HabbiconState.FAVOURITED;
        entry.owned = entry.favorite || state === HabbiconState.OWNED;
        entry.claimable = state === HabbiconState.CLAIMABLE;
        entry.purchasable = false;
        entry.isReward = true;
        entry.priceCredits = 0;
        entry.priceActivityPoints = 0;
        entry.activityPointType = collection.activityPointType;
        entry.color = HabbiconView.seededColor(entry.habbiconId * 37 + entry.collectionId * 11);

        return entry;
    }

    /**
	 * The owned tray keeps one group per collection; a collection with nothing owned is left out
	 * entirely rather than shown empty.
	 */
    // AS3: HabbiconView.as::createTrayGroups()
    private static createTrayGroups(album: HabbiconAlbumModel, favouritesOnly: boolean): HabbiconSetModel[]
    {
        const groups: HabbiconSetModel[] = [];

        for(const set of album.sets)
        {
            const entries: HabbiconEntryModel[] = [];

            for(const entry of set.habbicons)
            {
                if(favouritesOnly ? entry.favorite : entry.owned) entries.push(entry);
            }

            const reward = set.rewardHabbicon;

            if(reward !== null && (favouritesOnly ? reward.favorite : reward.owned)) entries.push(reward);

            if(entries.length > 0) groups.push(HabbiconView.createTrayGroup(set, entries));
        }

        return groups;
    }

    /**
	 * The favourites tab is *one* group across every collection, not one per collection — which is
	 * why it does not reuse `createTrayGroups(album, true)`.
	 */
    // AS3: HabbiconView.as::createFavouriteTrayGroups()
    private static createFavouriteTrayGroups(album: HabbiconAlbumModel): HabbiconSetModel[]
    {
        const groups: HabbiconSetModel[] = [];
        const entries: HabbiconEntryModel[] = [];

        for(const set of album.sets)
        {
            for(const entry of set.habbicons)
            {
                if(entry.favorite) entries.push(entry);
            }

            if(set.rewardHabbicon !== null && set.rewardHabbicon.favorite) entries.push(set.rewardHabbicon);
        }

        if(entries.length > 0)
        {
            const group = new HabbiconSetModel();

            group.id = HabbiconTabMode.FAVOURITED;
            group.name = HabbiconTabMode.FAVOURITED;
            group.title = '${habbicons.favourites.title}';
            group.habbicons = entries;

            groups.push(group);
        }

        return groups;
    }

    // AS3: HabbiconView.as::createTrayGroup()
    private static createTrayGroup(set: HabbiconSetModel, entries: HabbiconEntryModel[]): HabbiconSetModel
    {
        const group = new HabbiconSetModel();

        group.id = set.id;
        group.collectionId = set.collectionId;
        group.name = set.name;
        group.title = set.title;
        group.description = set.description;
        group.bitmap = set.bitmap;
        group.habbicons = entries;
        group.rewardHabbicon = null;
        group.completed = set.completed;
        group.total = set.total;
        group.priceCredits = set.priceCredits;
        group.priceActivityPoints = set.priceActivityPoints;
        group.activityPointType = set.activityPointType;
        group.canBuy = set.canBuy;

        return group;
    }

    /**
	 * The reward is excluded from a set's own progress — you complete a set to *earn* the reward, so
	 * counting it would make the set uncompletable. The album stats do count it, separately.
	 */
    // AS3: HabbiconView.as::updateSetProgress()
    private static updateSetProgress(set: HabbiconSetModel): void
    {
        set.completed = 0;
        set.total = 0;

        for(const entry of set.habbicons)
        {
            if(entry.isReward) continue;

            set.total++;

            if(entry.owned || entry.claimable) set.completed++;
        }
    }

    /**
	 * `collected` counts *claimable* habbicons through each set's `completed`, but the reward is only
	 * counted once actually owned — the two halves of this sum do not use the same test. AS3's own
	 * asymmetry, kept.
	 */
    // AS3: HabbiconView.as::updateAlbumStats()
    private static updateAlbumStats(album: HabbiconAlbumModel): void
    {
        album.stats = new HabbiconAlbumStats();

        for(const set of album.sets)
        {
            album.stats.total += set.total;
            album.stats.collected += set.completed;

            if(set.complete) album.stats.completedSets++;

            for(const entry of set.habbicons)
            {
                if(entry.owned) album.stats.ownedHabbicons++;
            }

            if(set.rewardHabbicon === null) continue;

            album.stats.total++;

            if(set.rewardHabbicon.owned)
            {
                album.stats.collected++;
                album.stats.ownedHabbicons++;
            }
        }
    }

    // AS3: HabbiconView.as::resolveCollectionTitle()
    private resolveCollectionTitle(collection: HabbiconCollectionData | null): string
    {
        if(collection === null || collection.name.length === 0) return 'Habbicon Collection';

        return this.localize(`habbicon_collection_${collection.name.toLowerCase()}_name`, collection.name);
    }

    // AS3: HabbiconView.as::resolveCollectionDescription()
    private resolveCollectionDescription(collection: HabbiconCollectionData | null): string
    {
        if(collection === null || collection.name.length === 0) return '';

        return this.localize(
            `habbicon_collection_${collection.name.toLowerCase()}_description`,
            `${collection.name} set description`
        );
    }

    // AS3: HabbiconView.as::resolveHabbiconDisplayName()
    private resolveHabbiconDisplayName(habbiconId: number, name: string | null = null): string
    {
        const key = HabbiconView.resolveHabbiconKey(habbiconId, name);

        if(key.length === 0) return 'Habbicon';

        return this.localize(
            `habbicon_${key.toLowerCase()}_name`,
            name !== null && name.length > 0 ? name : 'Habbicon'
        );
    }

    // AS3: HabbiconView.as::resolveHabbiconKey()
    private static resolveHabbiconKey(habbiconId: number, name: string | null = null): string
    {
        const key = HabbiconAssetManager.getHabbiconNameKey(habbiconId);

        return key !== null && key.length > 0 ? key : (name ?? '');
    }

    // AS3: HabbiconView.as::localize()
    private localize(key: string, fallback: string): string
    {
        const value = this._controller?.localizationManager?.getLocalization(key, fallback) ?? fallback;

        return value.length > 0 ? value : fallback;
    }

    // AS3: HabbiconView.as::hasHabbiconPrice()
    private static hasHabbiconPrice(entry: HabbiconEntryModel | null): boolean
    {
        return entry !== null && (entry.priceCredits > 0 || entry.priceActivityPoints > 0);
    }

    // AS3: HabbiconView.as::seededColor()
    private static seededColor(seed: number): number
    {
        return HabbiconView.SEEDED_COLORS[((seed % 6) + 6) % 6];
    }

    // AS3: HabbiconView.as::onWindowClose()
    private onWindowClose = (_event: WindowMouseEvent): void =>
    {
        this.hideWindow();
    };

    /**
	 * Hiding detaches the window from the desktop rather than setting `visible = false`, so a hidden
	 * hub also stops `shouldAnimateProgress()` returning true.
	 */
    // AS3: HabbiconView.as::hideWindow()
    private hideWindow(): void
    {
        this._popupController?.hide();
        this._popupController?.detachFromStage();

        const window = this._window as unknown as IWindow | null;

        if(this._windowManager === null || window === null || window.parent === null) return;

        const desktop = this._windowManager.getDesktop(HabbiconView.DESKTOP_WINDOW_LAYER);

        if(desktop !== null) (desktop as unknown as IWindowContainer).removeChild(window);
    }

    /**
	 * The tab is selected *and* the change handler called by hand on first show, because
	 * `HabbiconTabView.select()` deliberately does not fire its callback.
	 */
    // AS3: HabbiconView.as::showWindow()
    showWindow(): void
    {
        const desktop = this._windowManager?.getDesktop(HabbiconView.DESKTOP_WINDOW_LAYER) ?? null;
        const window = this._window as unknown as IWindow | null;

        if(this._windowManager !== null && window !== null && window.parent === null && desktop !== null)
        {
            (desktop as unknown as IWindowContainer).addChild(window);
        }

        if(desktop !== null) this._popupController?.attachToDesktop(desktop);

        if(!this._hasShown)
        {
            this._tabView?.select(HabbiconTabMode.ALL_SETS);
            this.onTabChanged(HabbiconTabMode.ALL_SETS);
            this._hasShown = true;
        }

        window?.activate();
    }

    // AS3: HabbiconView.as::update()
    update(delta: number): void
    {
        if(!this.shouldAnimateProgress()) return;

        this._headerView?.update(delta);

        if(this._activeTab !== HabbiconTabMode.ALL_SETS) return;

        this._setRailView?.update(delta);
        this._setPageView?.update(delta);
    }

    // AS3: HabbiconView.as::shouldAnimateProgress()
    private shouldAnimateProgress(): boolean
    {
        const window = this._window as unknown as IWindow | null;

        return window !== null && window.parent !== null;
    }

    // AS3: HabbiconView.as::isPointInsideAnyTile()
    private isPointInsideAnyTile = (x: number, y: number): boolean =>
    {
        const window = this._activeTile?.window as unknown as IWindow | null;

        return window !== null && window.visible && HabbiconView.isPointInsideWindow(window, x, y);
    };

    // AS3: HabbiconView.as::isPointInsideWindow()
    private static isPointInsideWindow(window: IWindow | null, x: number, y: number): boolean
    {
        if(window === null) return false;

        const rect = {x: 0, y: 0, width: 0, height: 0};

        window.getGlobalRectangle(rect);

        return x >= rect.x && y >= rect.y && x < rect.x + rect.width && y < rect.y + rect.height;
    }

    // AS3: HabbiconView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: HabbiconView.as::get headerButtonClose()
    private get headerButtonClose(): IWindow | null
    {
        return this._window?.findChildByName('header_button_close') ?? null;
    }

    // AS3: HabbiconView.as::get albumHeader()
    private get albumHeader(): IWindowContainer | null
    {
        return (this._window?.findChildByName('album_header') as IWindowContainer | null) ?? null;
    }

    // AS3: HabbiconView.as::get allSetsContainer()
    private get allSetsContainer(): IWindowContainer | null
    {
        return (this._window?.findChildByName('all_sets_container') as IWindowContainer | null) ?? null;
    }

    // AS3: HabbiconView.as::get setPageContainer()
    private get setPageContainer(): IWindowContainer | null
    {
        return (this._window?.findChildByName('set_page_container') as IWindowContainer | null) ?? null;
    }

    // AS3: HabbiconView.as::get setGrid()
    private get setGrid(): IItemGridWindow | null
    {
        return (this._window?.findChildByName('set_grid') as IItemGridWindow | null) ?? null;
    }

    // AS3: HabbiconView.as::get trayContainer()
    private get trayContainer(): IWindowContainer | null
    {
        return (this._window?.findChildByName('tray_container') as IWindowContainer | null) ?? null;
    }

    // AS3: HabbiconView.as::get trayGroupList()
    private get trayGroupList(): IItemListWindow | null
    {
        return (this._window?.findChildByName('tray_group_list') as IItemListWindow | null) ?? null;
    }

    // AS3: HabbiconView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.hideWindow();
        this.removeEventListeners();
        this._controller?.removeUpdateReceiver(this);

        if(this._headerView !== null)
        {
            this._headerView.dispose();
            this._headerView = null;
        }

        if(this._tabView !== null)
        {
            this._tabView.dispose();
            this._tabView = null;
        }

        if(this._setRailView !== null)
        {
            this._setRailView.dispose();
            this._setRailView = null;
        }

        if(this._setPageView !== null)
        {
            this._setPageView.dispose();
            this._setPageView = null;
        }

        if(this._trayView !== null)
        {
            this._trayView.dispose();
            this._trayView = null;
        }

        if(this._popupController !== null)
        {
            this._popupController.dispose();
            this._popupController = null;
        }

        HabbiconView.disposeTemplate(this._tileTemplate);
        HabbiconView.disposeTemplate(this._emptyTileTemplate);
        HabbiconView.disposeTemplate(this._trayTileTemplate);
        HabbiconView.disposeTemplate(this._trayGroupTemplate);

        this._tileTemplate = null;
        this._emptyTileTemplate = null;
        this._trayTileTemplate = null;
        this._trayGroupTemplate = null;

        (this._window as unknown as IWindow | null)?.dispose();
        this._window = null;
        this._album = null;
        this._activeSet = null;
        this._activeTile = null;
        this._controller = null;
        this._windowManager = null;
        this._disposed = true;
    }

    // AS3: HabbiconView.as::disposeTemplate()
    private static disposeTemplate(template: IWindowContainer | null): void
    {
        const window = template as unknown as IWindow | null;

        if(window !== null && !window.disposed) window.dispose();
    }
}
