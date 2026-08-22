/**
 * MessengerHabbiconPicker — the habbicon drop-down hung off the messenger's chat input.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as
 *
 * Sections, in order: favorites, recently used, then one per owned shop collection — or, while a
 * query is typed, a single "search results" band replacing the lot.
 *
 * The interesting part is the two dirty flags, because a full rebuild is expensive and the
 * controller fires on every owned/shop/recent change:
 *
 * - `_sectionsDirty` — the section *model* must be rebuilt from the controller.
 * - `_layoutDirty` — the model is current but the views must be laid out again.
 *
 * `renderIfDirty()` is the only place either is cleared, and a query change forces `_layoutDirty`
 * on its own. A narrow update (one habbicon changed, both flags already clean) takes
 * `refreshNarrowControllerUpdate()` instead, which diffs section-by-section and reuses the views
 * whose content did not move — that is what keeps the scroll position across a favourite toggle.
 *
 * Field names are DERIVED: habbicons postdate the 2016 PRODUCTION tree, so no unobfuscated build
 * exists to recover them from. Each is named for what its uses do with it.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabbiconController} from '@habbo/catalog/habbicons/IHabbiconController';
import {HabbiconControllerEvent} from '@habbo/catalog/habbicons/HabbiconControllerEvent';
import type {HabbiconCollectionData} from '@habbo/communication/messages/incoming/habbicons/HabbiconCollectionData';
import type {OwnedHabbiconData} from '@habbo/communication/messages/incoming/habbicons/OwnedHabbiconData';
import {HabbiconAssetManager} from '@habbo/habbicons/assets/HabbiconAssetManager';
import {MessengerHabbiconPickerEntry} from './MessengerHabbiconPickerEntry';
import {MessengerHabbiconPickerSection} from './MessengerHabbiconPickerSection';
import {MessengerHabbiconPickerSectionView} from './MessengerHabbiconPickerSectionView';

export class MessengerHabbiconPicker
{
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::SECTION_FAVORITES
    private static readonly SECTION_FAVORITES: string = 'favorites';

    /** Derived name — `_SafeStr_10952`. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::_SafeStr_10952
    private static readonly SECTION_RECENT: string = 'recent';

    /** Derived name — `_SafeStr_10466`. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::_SafeStr_10466
    private static readonly SECTION_COLLECTION: string = 'collection';

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::SECTION_SEARCH
    private static readonly SECTION_SEARCH: string = 'search';

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::MENU_MIN_HEIGHT
    private static readonly MENU_MIN_HEIGHT: number = 94;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::MENU_MAX_HEIGHT
    private static readonly MENU_MAX_HEIGHT: number = 304;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::TOP_BAR_HEIGHT
    private static readonly TOP_BAR_HEIGHT: number = 42;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::BOTTOM_PADDING
    private static readonly BOTTOM_PADDING: number = 6;

    /** AS3's literal `46` in `updateHeight()` — the shortest the section list is allowed to get. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::updateHeight()
    private static readonly SECTION_LIST_MIN_HEIGHT: number = 46;

    /** AS3's literal `27` in `onSearchKeyDown()` — Escape. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::onSearchKeyDown()
    private static readonly KEY_ESCAPE: number = 27;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::_window
    private _window: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_4593`: the habbicon controller everything is read from. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::_SafeStr_4593
    private _controller: IHabbiconController | null = null;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::_localization
    private _localization: IHabboLocalizationManager | null = null;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;

    /** Derived name — `_SafeStr_7074`: the owner's `(habbiconId, keepOpen)` callback. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::_SafeStr_7074
    private _onSelected: ((habbiconId: number, keepOpen: boolean) => void) | null = null;

    /** Derived name — `_SafeStr_6261`: the section container lifted out of the layout. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::_SafeStr_6261
    private _sectionTemplate: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_4882`: the live section views, index-aligned with `_sections`. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::_SafeStr_4882
    private _sectionViews: MessengerHabbiconPickerSectionView[] = [];

    /** Derived name — `_SafeStr_4701`: the section model. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::_SafeStr_4701
    private _sections: MessengerHabbiconPickerSection[] = [];

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::_ownedSearchEntries
    private _ownedSearchEntries: MessengerHabbiconPickerEntry[] = [];

    /** Derived name — `_SafeStr_5688`: habbicon id → entry, so sections can share entry objects. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::_SafeStr_5688
    private _entriesById: Map<number, MessengerHabbiconPickerEntry> = new Map();

    /** Derived name — `_SafeStr_5563`: the section model must be rebuilt. Starts dirty. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::_SafeStr_5563
    private _sectionsDirty: boolean = true;

    /** Derived name — `_SafeStr_5172`: the views must be laid out again. Starts dirty. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::_SafeStr_5172
    private _layoutDirty: boolean = true;

    /** Derived name — `_SafeStr_6607`: a recent-list change arrived while the menu was open. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::_SafeStr_6607
    private _recentUpdateDeferred: boolean = false;

    /** Derived name — `_SafeStr_8104`: the query the current layout was built for. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::_SafeStr_8104
    private _lastQuery: string | null = null;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::MessengerHabbiconPicker()
    constructor(
        window: IWindowContainer,
        controller: IHabbiconController | null,
        localization: IHabboLocalizationManager | null,
        windowManager: IHabboWindowManager | null,
        onSelected: ((habbiconId: number, keepOpen: boolean) => void) | null
    )
    {
        this._window = window;
        this._controller = controller;
        this._localization = localization;
        this._windowManager = windowManager;
        this._onSelected = onSelected;

        this._window.visible = false;

        const sectionList = this.sectionList;
        const template = sectionList?.getListItemByName('habbicon_section_template') ?? null;

        this._sectionTemplate = template
            ? (sectionList!.removeListItem(template) as IWindowContainer | null)
            : null;

        this.searchInput?.addEventListener('WE_CHANGE', this.onSearchChanged);
        this.searchInput?.addEventListener('WKE_KEY_DOWN', this.onSearchKeyDown as never);
        this.searchPlaceholder?.addEventListener('WME_DOWN', this.onSearchPlaceholderDown as never);
        this.searchClearButton?.addEventListener('WME_CLICK', this.onSearchClearClicked as never);
        this.openHubButton?.addEventListener('WME_CLICK', this.onOpenHubClicked as never);

        if(this._controller !== null)
        {
            this._controller.addEventListener(HabbiconControllerEvent.OWNED_HABBICONS_UPDATED, this.onControllerDataUpdated);
            this._controller.addEventListener(HabbiconControllerEvent.SHOP_DATA_UPDATED, this.onControllerDataUpdated);
            this._controller.addEventListener(HabbiconControllerEvent.RECENT_HABBICONS_UPDATED, this.onRecentHabbiconsUpdated);
        }

        this.setSearchState(false);
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::isWindowInTree()
    private static isWindowInTree(window: IWindow | null, root: IWindow | null): boolean
    {
        while(window != null)
        {
            if(window === root)
            {
                return true;
            }

            window = window.parent;
        }

        return false;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::show()
    public show(): void
    {
        if(this._disposed) return;

        this.applyDeferredRecentSectionUpdate();
        this.renderIfDirty();

        this._window!.visible = true;
        this._window!.activate();

        this.focusSearch();
    }

    /**
     * `resetUnseen` is false when the picker closes because a habbicon was picked — that path
     * clears only the one counter, so the rest stay marked.
     */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::hide()
    public hide(resetUnseen: boolean = true): void
    {
        if(this._disposed) return;

        this._window!.visible = false;

        if(resetUnseen && this._controller !== null)
        {
            this._controller.resetUnseenHabbicons();
            this.invalidateLayout();
        }
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::toggle()
    public toggle(): void
    {
        if(this.visible)
        {
            this.hide();
        }
        else
        {
            this.show();
        }
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::get visible()
    public get visible(): boolean
    {
        return !this._disposed && Boolean(this._window?.visible);
    }

    /** Used by the owner to tell a click inside the menu from one that should close it. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::containsWindow()
    public containsWindow(window: IWindow | null): boolean
    {
        return !this._disposed && MessengerHabbiconPicker.isWindowInTree(window, this._window);
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::focusSearch()
    public focusSearch(): void
    {
        if(!this._disposed)
        {
            this.searchInput?.focus();
        }
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::setPosition()
    public setPosition(x: number, y: number): void
    {
        if(!this._disposed && this._window !== null)
        {
            this._window.x = x;
            this._window.y = y;
        }
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::get window()
    public get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * A single-habbicon change (`habbiconId > 0`) with both flags already clean takes the narrow
     * path; anything else invalidates the model wholesale.
     */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::onControllerDataUpdated()
    private onControllerDataUpdated = (event: HabbiconControllerEvent): void =>
    {
        if(event != null && event.habbiconId > 0 && !this._sectionsDirty && !this._layoutDirty)
        {
            if(this.visible)
            {
                this.refreshNarrowControllerUpdate();
            }
            else
            {
                this.invalidateSections();
            }

            return;
        }

        this.invalidateSections();

        if(this.visible)
        {
            this.renderIfDirty();
        }
    };

    /**
     * Reordering the recent band under the user's cursor would move the tile they are aiming at, so
     * an update that lands while the menu is open is deferred until it next opens.
     */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::onRecentHabbiconsUpdated()
    private onRecentHabbiconsUpdated = (): void =>
    {
        if(this.visible)
        {
            this._recentUpdateDeferred = true;

            return;
        }

        if(this._sectionsDirty) return;

        if(this.refreshRecentSectionState())
        {
            this.invalidateLayout();
        }
    };

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::applyDeferredRecentSectionUpdate()
    private applyDeferredRecentSectionUpdate(): void
    {
        if(!this._recentUpdateDeferred) return;

        this._recentUpdateDeferred = false;

        if(this._sectionsDirty) return;

        if(this.refreshRecentSectionState())
        {
            this._layoutDirty = true;
        }
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::invalidateSections()
    private invalidateSections(): void
    {
        this._sectionsDirty = true;
        this._layoutDirty = true;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::invalidateLayout()
    private invalidateLayout(): void
    {
        this._layoutDirty = true;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::renderIfDirty()
    private renderIfDirty(): void
    {
        const query = this.normalizedQuery();

        if(this._lastQuery !== query)
        {
            this._layoutDirty = true;
        }

        if(!this._sectionsDirty && !this._layoutDirty)
        {
            this.setSearchState(query.length > 0);

            return;
        }

        if(this._sectionsDirty)
        {
            this.refreshSections();
            this._sectionsDirty = false;
        }

        this.refresh(query);

        this._lastQuery = query;
        this._layoutDirty = false;
    }

    /**
     * Rebuilds the model from the controller. Every entry object is shared through `_entriesById`,
     * so a habbicon appearing in favorites, recent and its collection is one object in three
     * sections — which is what makes `sameEntries()`'s id comparison cheap and stable.
     */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::refreshSections()
    private refreshSections(): void
    {
        const favorites: MessengerHabbiconPickerEntry[] = [];

        this._sections = [];
        this._ownedSearchEntries = [];
        this._entriesById = new Map();

        if(this._controller === null) return;

        for(const owned of this._controller.ownedHabbicons)
        {
            const entry = this.createEntry(owned);

            if(entry !== null)
            {
                this._entriesById.set(entry.habbiconId, entry);
                this._ownedSearchEntries.push(entry);

                if(entry.favorite)
                {
                    favorites.push(entry);
                }
            }
        }

        this.sortEntries(this._ownedSearchEntries);
        this.sortEntries(favorites);

        const recent = this.buildRecentEntries();

        if(favorites.length > 0)
        {
            this._sections.push(new MessengerHabbiconPickerSection(
                MessengerHabbiconPicker.SECTION_FAVORITES,
                MessengerHabbiconPicker.SECTION_FAVORITES,
                this.localize('habbicons.favourites.title', 'Favorites'),
                favorites
            ));
        }

        if(recent.length > 0)
        {
            this._sections.push(new MessengerHabbiconPickerSection(
                MessengerHabbiconPicker.SECTION_RECENT,
                MessengerHabbiconPicker.SECTION_RECENT,
                this.localize('habbicon.recently.used', 'Recently used'),
                recent
            ));
        }

        this.addOwnedSetSections();
    }

    /**
     * One section per collection the user owns something from — a collection's reward habbicon
     * counts as one of its members, which is why it is appended separately.
     */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::addOwnedSetSections()
    private addOwnedSetSections(): void
    {
        if(this._controller === null || !this._controller.hasLoadedShopData) return;

        for(const collection of this._controller.shopCollections)
        {
            if(collection == null) continue;

            const entries: MessengerHabbiconPickerEntry[] = [];

            if(collection.habbicons != null)
            {
                for(const item of collection.habbicons)
                {
                    if(item == null) continue;

                    const entry = this._entriesById.get(item.habbiconId) ?? null;

                    if(entry !== null)
                    {
                        entries.push(entry);
                    }
                }
            }

            if(collection.rewardHabbiconId > 0)
            {
                const entry = this._entriesById.get(collection.rewardHabbiconId) ?? null;

                if(entry !== null)
                {
                    entries.push(entry);
                }
            }

            if(entries.length > 0)
            {
                this._sections.push(new MessengerHabbiconPickerSection(
                    MessengerHabbiconPicker.SECTION_COLLECTION,
                    `${MessengerHabbiconPicker.SECTION_COLLECTION}:${collection.collectionId}`,
                    this.resolveCollectionTitle(collection),
                    entries
                ));
            }
        }
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::refreshNarrowControllerUpdate()
    private refreshNarrowControllerUpdate(): void
    {
        const query = this.normalizedQuery();
        const previous = this._sections.concat();

        this.refreshSections();

        this._sectionsDirty = false;
        this._layoutDirty = false;
        this._lastQuery = query;

        if(query.length > 0)
        {
            this.refreshSearchResultsSection(query);

            return;
        }

        this.renderChangedSections(previous);
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::refreshSearchResultsSection()
    private refreshSearchResultsSection(query: string): void
    {
        const scroll = Number(this.sectionList?.scrollV ?? 0);

        this.clearSections();
        this.setSearchState(true);

        const added = this.addSearchResultsSection(query);
        const emptyView = this.emptyView;

        if(emptyView) emptyView.visible = added === 0;

        this.updateHeight();

        if(this.sectionList) this.sectionList.scrollV = scroll;
    }

    /**
     * The diffing re-render. A section whose key *and* content are unchanged keeps its existing
     * view — the surviving views are marked in `kept` so the leftovers can be disposed after.
     */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::renderChangedSections()
    private renderChangedSections(previous: MessengerHabbiconPickerSection[]): void
    {
        const previousViews = this._sectionViews;
        const kept = new Set<number>();
        const sectionList = this.sectionList;
        const scroll = Number(sectionList?.scrollV ?? 0);
        const emptyView = this.emptyView;

        if(this.sameSections(previous, this._sections))
        {
            if(emptyView) emptyView.visible = this._sections.length === 0;

            return;
        }

        sectionList?.removeListItems();

        this._sectionViews = [];

        for(const section of this._sections)
        {
            const index = this.findSectionIndexByKey(previous, section.key);
            let view: MessengerHabbiconPickerSectionView;

            if(index >= 0 && index < previousViews.length
                && this.sameSection(previous[index], section))
            {
                view = previousViews[index];
                kept.add(index);
            }
            else
            {
                if(index >= 0 && index < previousViews.length)
                {
                    previousViews[index].dispose();
                    kept.add(index);
                }

                view = this.createSectionView(section);
            }

            this._sectionViews.push(view);

            if(view.window) sectionList?.addListItem(view.window);
        }

        for(let index = 0; index < previousViews.length; index++)
        {
            if(!kept.has(index))
            {
                previousViews[index].dispose();
            }
        }

        if(emptyView) emptyView.visible = this._sections.length === 0;

        this.updateHeight();

        if(sectionList) sectionList.scrollV = scroll;
    }

    /** Recent ids the user no longer owns are skipped, not shown as gaps. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::buildRecentEntries()
    private buildRecentEntries(): MessengerHabbiconPickerEntry[]
    {
        const recent: MessengerHabbiconPickerEntry[] = [];

        if(this._controller === null) return recent;

        for(const habbiconId of this._controller.recentHabbiconIds)
        {
            const entry = this._entriesById.get(habbiconId) ?? null;

            if(entry !== null)
            {
                recent.push(entry);
            }
        }

        return recent;
    }

    /** Returns whether the model actually moved — the caller only invalidates when it did. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::refreshRecentSectionState()
    private refreshRecentSectionState(): boolean
    {
        const recent = this.buildRecentEntries();
        const index = this.recentSectionIndex();

        if(index >= 0)
        {
            if(this.sameEntries(this._sections[index].entries, recent))
            {
                return false;
            }
        }

        if(recent.length === 0)
        {
            if(index >= 0)
            {
                this._sections.splice(index, 1);

                return true;
            }

            return false;
        }

        if(index >= 0)
        {
            this._sections[index].entries = recent;

            return true;
        }

        this._sections.splice(this.recentInsertIndex(), 0, new MessengerHabbiconPickerSection(
            MessengerHabbiconPicker.SECTION_RECENT,
            MessengerHabbiconPicker.SECTION_RECENT,
            this.localize('habbicon.recently.used', 'Recently used'),
            recent
        ));

        return true;
    }

    /** Declared by AS3 and called by nothing in this build. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::renderRecentSection()
    private renderRecentSection(): void
    {
        const index = this.recentSectionIndex();
        const sectionList = this.sectionList;
        const scroll = Number(sectionList?.scrollV ?? 0);

        if(index < 0)
        {
            this.removeRecentSectionView(scroll);

            return;
        }

        if(index < this._sectionViews.length && this._sectionViews[index].key === MessengerHabbiconPicker.SECTION_RECENT)
        {
            this._sectionViews[index].dispose();
            this._sectionViews.splice(index, 1);
        }

        const view = this.createSectionView(this._sections[index]);

        this._sectionViews.splice(index, 0, view);

        if(view.window) sectionList?.addListItemAt(view.window, index);

        this.updateHeight();

        if(sectionList) sectionList.scrollV = scroll;

        const emptyView = this.emptyView;

        if(emptyView) emptyView.visible = this._sections.length === 0;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::removeRecentSectionView()
    private removeRecentSectionView(scroll: number): void
    {
        for(let index = 0; index < this._sectionViews.length; index++)
        {
            const view = this._sectionViews[index];

            if(view.key === MessengerHabbiconPicker.SECTION_RECENT)
            {
                view.dispose();
                this._sectionViews.splice(index, 1);

                this.updateHeight();

                if(this.sectionList) this.sectionList.scrollV = scroll;

                const emptyView = this.emptyView;

                if(emptyView) emptyView.visible = this._sections.length === 0;

                return;
            }
        }
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::recentSectionIndex()
    private recentSectionIndex(): number
    {
        for(let index = 0; index < this._sections.length; index++)
        {
            if(this._sections[index].type === MessengerHabbiconPicker.SECTION_RECENT)
            {
                return index;
            }
        }

        return -1;
    }

    /** Recent goes after favorites when there is one, first otherwise. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::recentInsertIndex()
    private recentInsertIndex(): number
    {
        const first = this._sections.length > 0 ? this._sections[0] : null;

        return first != null && first.type === MessengerHabbiconPicker.SECTION_FAVORITES ? 1 : 0;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::sameEntries()
    private sameEntries(
        a: MessengerHabbiconPickerEntry[] | null,
        b: MessengerHabbiconPickerEntry[] | null
    ): boolean
    {
        if(a == null || b == null || a.length !== b.length)
        {
            return false;
        }

        for(let index = 0; index < a.length; index++)
        {
            if(a[index].habbiconId !== b[index].habbiconId)
            {
                return false;
            }
        }

        return true;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::sameSection()
    private sameSection(
        a: MessengerHabbiconPickerSection | null,
        b: MessengerHabbiconPickerSection | null
    ): boolean
    {
        return a != null && b != null && a.type === b.type && a.key === b.key && a.title === b.title
            && this.sameEntries(a.entries, b.entries);
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::sameSections()
    private sameSections(
        a: MessengerHabbiconPickerSection[] | null,
        b: MessengerHabbiconPickerSection[] | null
    ): boolean
    {
        if(a == null || b == null || a.length !== b.length)
        {
            return false;
        }

        for(let index = 0; index < a.length; index++)
        {
            if(!this.sameSection(a[index], b[index]))
            {
                return false;
            }
        }

        return true;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::findSectionIndexByKey()
    private findSectionIndexByKey(sections: MessengerHabbiconPickerSection[], key: string): number
    {
        for(let index = 0; index < sections.length; index++)
        {
            if(sections[index].key === key)
            {
                return index;
            }
        }

        return -1;
    }

    /**
     * Only owned and favourited habbicons make the picker — states 2 and 3. Anything still in the
     * shop, or claimable but unclaimed, is not something the user can post.
     */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::createEntry()
    private createEntry(owned: OwnedHabbiconData): MessengerHabbiconPickerEntry | null
    {
        const state = owned.habbiconState;

        if(state !== 2 && state !== 3)
        {
            return null;
        }

        return new MessengerHabbiconPickerEntry(
            owned.habbiconId, this.resolveEntryName(owned.habbiconId), state === 3
        );
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::resolveEntryName()
    private resolveEntryName(habbiconId: number): string
    {
        const key = HabbiconAssetManager.getHabbiconNameKey(habbiconId);

        return key != null && key.length > 0 ? this.localize(`habbicon_${key}_name`, key) : 'Habbicon';
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::resolveCollectionTitle()
    private resolveCollectionTitle(collection: HabbiconCollectionData): string
    {
        if(collection.name == null || collection.name.length === 0)
        {
            return 'Habbicons';
        }

        return this.localize(`habbicon_collection_${collection.name}_name`, collection.name);
    }

    /** The full re-render: either the search band alone, or every section in model order. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::refresh()
    private refresh(query: string): void
    {
        this.clearSections();
        this.setSearchState(query.length > 0);

        const emptyView = this.emptyView;

        if(query.length > 0)
        {
            const added = this.addSearchResultsSection(query);

            if(emptyView) emptyView.visible = added === 0;

            this.updateHeight();

            return;
        }

        let count = 0;

        for(const section of this._sections)
        {
            this.addSection(section.type, section.key, section.title, section.entries);
            count++;
        }

        if(emptyView) emptyView.visible = count === 0;

        this.updateHeight();
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::addSearchResultsSection()
    private addSearchResultsSection(query: string): number
    {
        const matches: MessengerHabbiconPickerEntry[] = [];

        for(const entry of this._ownedSearchEntries)
        {
            if(entry.searchName.indexOf(query) >= 0)
            {
                matches.push(entry);
            }
        }

        if(matches.length === 0)
        {
            return 0;
        }

        this.addSection(
            MessengerHabbiconPicker.SECTION_SEARCH, MessengerHabbiconPicker.SECTION_SEARCH, this.localize('habbicon.search.results', 'Search results'), matches
        );

        return 1;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::addSection()
    private addSection(
        type: string, key: string, title: string, entries: MessengerHabbiconPickerEntry[]
    ): void
    {
        const view = this.createSectionView(new MessengerHabbiconPickerSection(type, key, title, entries));

        this._sectionViews.push(view);

        if(view.window) this.sectionList?.addListItem(view.window);
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::createSectionView()
    private createSectionView(section: MessengerHabbiconPickerSection): MessengerHabbiconPickerSectionView
    {
        return new MessengerHabbiconPickerSectionView(
            this._sectionTemplate!,
            section.type,
            section.key,
            section.title,
            section.entries,
            this.onHabbiconSelected,
            this._windowManager,
            this.isUnseenHabbicon,
            this.onSelectorWheel
        );
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::clearSections()
    private clearSections(): void
    {
        for(const view of this._sectionViews)
        {
            view.dispose();
        }

        this._sectionViews.length = 0;
    }

    /**
     * `keepOpen` is the shift key. Holding it keeps the menu up for the next pick and only clears
     * that habbicon's unseen badge; a plain click closes without resetting the others.
     */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::onHabbiconSelected()
    private onHabbiconSelected = (habbiconId: number, keepOpen: boolean): void =>
    {
        this._controller?.removeUnseenHabbicon(habbiconId);
        this._onSelected?.(habbiconId, keepOpen);

        if(!keepOpen)
        {
            this.hide(false);
        }
        else
        {
            this.clearUnseenCounterForHabbicon(habbiconId);
        }
    };

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::clearUnseenCounterForHabbicon()
    private clearUnseenCounterForHabbicon(habbiconId: number): void
    {
        for(const view of this._sectionViews)
        {
            view.clearUnseenCounterForHabbicon(habbiconId);
        }
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::isUnseenHabbicon()
    private isUnseenHabbicon = (habbiconId: number): boolean =>
    {
        return this._controller !== null && this._controller.isUnseenHabbicon(habbiconId);
    };

    /** Grows with its content up to `MENU_MAX_HEIGHT`, then the section list scrolls instead. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::updateHeight()
    private updateHeight(): void
    {
        const sectionList = this.sectionList;

        if(this._window == null || sectionList == null) return;

        const contentHeight = Math.trunc(sectionList.scrollableRegion.height);
        const available = MessengerHabbiconPicker.MENU_MAX_HEIGHT - MessengerHabbiconPicker.TOP_BAR_HEIGHT - MessengerHabbiconPicker.BOTTOM_PADDING;
        const listHeight = Math.min(Math.max(MessengerHabbiconPicker.SECTION_LIST_MIN_HEIGHT, contentHeight + 2), available);

        sectionList.height = listHeight;
        this._window.height = Math.max(MessengerHabbiconPicker.MENU_MIN_HEIGHT, MessengerHabbiconPicker.TOP_BAR_HEIGHT + listHeight + MessengerHabbiconPicker.BOTTOM_PADDING);
        this._window.invalidate();
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::normalizedQuery()
    private normalizedQuery(): string
    {
        const text = this.searchInput?.text ?? null;

        return text != null ? text.toLowerCase() : '';
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::onSearchChanged()
    private onSearchChanged = (): void =>
    {
        this.invalidateLayout();
        this.renderIfDirty();
    };

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::onSearchKeyDown()
    private onSearchKeyDown = (event: WindowKeyboardEvent): void =>
    {
        if(event.keyCode === MessengerHabbiconPicker.KEY_ESCAPE && (this.searchInput?.text.length ?? 0) > 0)
        {
            this.clearSearch();
        }
    };

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::onSearchPlaceholderDown()
    private onSearchPlaceholderDown = (): void =>
    {
        this.searchInput?.focus();
    };

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::onSearchClearClicked()
    private onSearchClearClicked = (): void =>
    {
        this.clearSearch();
    };

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::onOpenHubClicked()
    private onOpenHubClicked = (): void =>
    {
        this._controller?.openHabbiconHub();
        this.hide(false);
    };

    /**
     * A horizontal wheel scrolls horizontally with its delta inverted; shift does the same on a
     * vertical wheel. Propagation is only stopped when the list actually consumed the scroll, so a
     * list already at its end lets the page behind it scroll.
     */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::onSelectorWheel()
    private onSelectorWheel = (event: WindowMouseEvent): void =>
    {
        const sectionList = this.sectionList;

        if(sectionList == null) return;

        const horizontal = event.type === 'WME_WHEEL_HORIZONTAL';
        const delta = Number(horizontal ? -event.delta : event.delta);

        if(sectionList.scrollWithWheel(delta, horizontal || event.shiftKey))
        {
            event.stopPropagation();
        }
    };

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::clearSearch()
    private clearSearch(): void
    {
        if(this.searchInput) this.searchInput.text = '';

        this.invalidateLayout();
        this.renderIfDirty();
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::setSearchState()
    private setSearchState(searching: boolean): void
    {
        const placeholder = this.searchPlaceholder;
        const clearButton = this.searchClearButton;

        if(placeholder) (placeholder as unknown as IWindow).visible = !searching;
        if(clearButton) clearButton.visible = searching;
    }

    /**
     * AS3 tests the result for null; this port's `getLocalizationWithParams()` never returns null
     * (see `project_getstring_never_null`), so the length test is what carries the fallback.
     */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::localize()
    private localize(key: string, fallback: string): string
    {
        const value = this._localization !== null
            ? this._localization.getLocalizationWithParams(key, fallback)
            : fallback;

        return value != null && value.length > 0 ? value : fallback;
    }

    /** Favourites first, then by name, then by id so the order is total and stable. */
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::sortEntries()
    private sortEntries(entries: MessengerHabbiconPickerEntry[]): void
    {
        entries.sort((a, b) =>
        {
            if(a.favorite !== b.favorite)
            {
                return a.favorite ? -1 : 1;
            }

            if(a.name < b.name) return -1;
            if(a.name > b.name) return 1;

            return a.habbiconId - b.habbiconId;
        });
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::get sectionList()
    private get sectionList(): IItemListWindow | null
    {
        return (this._window?.findChildByName('habbicon_section_list') ?? null) as IItemListWindow | null;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::get searchInput()
    private get searchInput(): ITextFieldWindow | null
    {
        return (this._window?.findChildByName('habbicon_search_input') ?? null) as unknown as ITextFieldWindow | null;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::get searchPlaceholder()
    private get searchPlaceholder(): ITextWindow | null
    {
        return (this._window?.findChildByName('habbicon_search_placeholder') ?? null) as ITextWindow | null;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::get searchClearButton()
    private get searchClearButton(): IWindow | null
    {
        return this._window?.findChildByName('habbicon_search_clear_button') ?? null;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::get openHubButton()
    private get openHubButton(): IWindow | null
    {
        return this._window?.findChildByName('habbicon_open_hub_button') ?? null;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::get emptyView()
    private get emptyView(): IWindowContainer | null
    {
        return (this._window?.findChildByName('empty_view') ?? null) as IWindowContainer | null;
    }

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPicker.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        if(this._controller !== null)
        {
            this._controller.removeEventListener(HabbiconControllerEvent.OWNED_HABBICONS_UPDATED, this.onControllerDataUpdated);
            this._controller.removeEventListener(HabbiconControllerEvent.SHOP_DATA_UPDATED, this.onControllerDataUpdated);
            this._controller.removeEventListener(HabbiconControllerEvent.RECENT_HABBICONS_UPDATED, this.onRecentHabbiconsUpdated);
            this._controller = null;
        }

        this.searchInput?.removeEventListener('WE_CHANGE', this.onSearchChanged);
        this.searchInput?.removeEventListener('WKE_KEY_DOWN', this.onSearchKeyDown as never);
        this.searchPlaceholder?.removeEventListener('WME_DOWN', this.onSearchPlaceholderDown as never);
        this.searchClearButton?.removeEventListener('WME_CLICK', this.onSearchClearClicked as never);
        this.openHubButton?.removeEventListener('WME_CLICK', this.onOpenHubClicked as never);

        this.clearSections();

        if(this._sectionTemplate !== null)
        {
            this._sectionTemplate.dispose();
            this._sectionTemplate = null;
        }

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }

        this._localization = null;
        this._windowManager = null;
        this._onSelected = null;
        this._sections = [];
        this._ownedSearchEntries = [];
        this._entriesById = new Map();
        this._disposed = true;
    }
}
