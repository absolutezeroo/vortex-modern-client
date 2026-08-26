/**
 * HabbiconSelector — the habbicon picker popup hung off the room chat input's "chat extra" button.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as
 *
 * A close cousin of `MessengerHabbiconPicker` (same section model, same section/collection/search
 * ordering, near-identical AS3 field names) but NOT a twin — three real differences, all kept:
 *
 * - This class builds and owns its window itself (`habbiconselector_menu_xml`), then anchors it to
 *   the "chat extra" button every time it opens (`alignToAnchor()` — clamped off the screen's left
 *   edge and never above y=0). `MessengerHabbiconPicker` receives an already-built, externally
 *   positioned window instead.
 * - There is no separate `*SectionView`/`*TileView` split here — AS3 keeps the whole grid-building
 *   routine (`createSectionWindow()`) inline in this one class, so this port does too.
 * - It tolerates a null controller: `_recentHabbiconIds` is a *local* recency list, kept in sync
 *   from the controller (`syncRecentHabbiconIds()`) when one exists, and grown locally
 *   (`addRecentHabbicon()`) as the only source of truth when one does not.
 *
 * Clicking a habbicon does not insert a chat token — it sends `TriggerHabbiconMessageComposer`
 * straight to the room, the same way Sign/Dance/expressions do, and the server echoes it back as a
 * bubble over the sender's own avatar.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import type {IHabbiconController} from '@habbo/catalog/habbicons/IHabbiconController';
import {HabbiconControllerEvent} from '@habbo/catalog/habbicons/HabbiconControllerEvent';
import type {OwnedHabbiconData} from '@habbo/communication/messages/incoming/habbicons/OwnedHabbiconData';
import {HabbiconAssetManager} from '@habbo/habbicons/assets/HabbiconAssetManager';
import {
    TriggerHabbiconMessageComposer
} from '@habbo/communication/messages/outgoing/habbicons/TriggerHabbiconMessageComposer';
import type {RoomChatInputView} from '../RoomChatInputView';
import {HabbiconSelectorEntry} from './HabbiconSelectorEntry';
import {HabbiconSelectorSection} from './HabbiconSelectorSection';

export class HabbiconSelector
{
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::SCREEN_LEFT_BORDER
    private static readonly SCREEN_LEFT_BORDER: number = 92;

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::CHAT_BAR_POPUP_OFFSET
    private static readonly CHAT_BAR_POPUP_OFFSET: number = 55;

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::MENU_MIN_HEIGHT
    private static readonly MENU_MIN_HEIGHT: number = 91;

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::MENU_MAX_HEIGHT
    private static readonly MENU_MAX_HEIGHT: number = 292;

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::TOP_BAR_HEIGHT
    private static readonly TOP_BAR_HEIGHT: number = 42;

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::BOTTOM_PADDING
    private static readonly BOTTOM_PADDING: number = 6;

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::GRID_COLUMNS
    private static readonly GRID_COLUMNS: number = 5;

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::SLOT_SIZE
    private static readonly SLOT_SIZE: number = 42;

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::SLOT_SPACING
    private static readonly SLOT_SPACING: number = 2;

    /** AS3's literal `20` in `createSectionWindow()` — the title strip above the grid. */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::createSectionWindow()
    private static readonly TITLE_HEIGHT: number = 20;

    /** AS3's literal `46` in `updateHeight()` — the shortest the section list is allowed to get. */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::updateHeight()
    private static readonly SECTION_LIST_MIN_HEIGHT: number = 46;

    /** AS3's literal `27` in `onSearchKeyDown()` — Escape. */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::onSearchKeyDown()
    private static readonly KEY_ESCAPE: number = 27;

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::SLOT_FILLED_COLOR
    private static readonly SLOT_FILLED_COLOR: number = 4280229663;

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::SLOT_EMPTY_COLOR
    private static readonly SLOT_EMPTY_COLOR: number = 4281611316;

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::SLOT_FILLED_HOVER_COLOR
    private static readonly SLOT_FILLED_HOVER_COLOR: number = 4280953386;

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::RECENT_LIMIT
    private static readonly RECENT_LIMIT: number = 10;

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::SECTION_FAVORITES
    private static readonly SECTION_FAVORITES: string = 'favorites';

    /** Derived name — `_SafeStr_10952`. */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::_SafeStr_10952
    private static readonly SECTION_RECENT: string = 'recent';

    /** Derived name — `_SafeStr_10466`. */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::_SafeStr_10466
    private static readonly SECTION_COLLECTION: string = 'collection';

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::SECTION_SEARCH
    private static readonly SECTION_SEARCH: string = 'search';

    /**
     * TS-only: `createImageBitmap` is async; AS3's `new BitmapData(40, 40, false, color)` fallback
     * (used while a habbicon's spritesheet frame has not loaded yet) is synchronous. This mirrors
     * the async-fallback technique `MessengerHabbiconPickerTileView` already uses for its
     * (transparent) blank placeholder, keyed by color and cached since `seededColor()` only ever
     * returns one of six fixed values.
     */
    private static readonly COLOR_PLACEHOLDERS: Map<number, Promise<ImageBitmap>> = new Map();

    // TS-only: see `COLOR_PLACEHOLDERS`.
    private static getColorPlaceholder(color: number): Promise<ImageBitmap>
    {
        let cached = HabbiconSelector.COLOR_PLACEHOLDERS.get(color);

        if(cached === undefined)
        {
            const canvas = new OffscreenCanvas(40, 40);
            const context = canvas.getContext('2d');

            if(context !== null)
            {
                context.fillStyle = `#${(color & 0xFFFFFF).toString(16).padStart(6, '0')}`;
                context.fillRect(0, 0, 40, 40);
            }

            cached = createImageBitmap(canvas);
            HabbiconSelector.COLOR_PLACEHOLDERS.set(color, cached);
        }

        return cached;
    }

    /** Derived name — `_SafeStr_4695`: the owning chat input view. */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::_SafeStr_4695
    private _chatInputView: RoomChatInputView | null;

    /** Derived name — `_SafeStr_4593`: the habbicon controller everything is read from, if any. */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::_SafeStr_4593
    private _controller: IHabbiconController | null;

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::_window
    private _window: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_7161`: the "chat extra" button this popup anchors to. */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::_SafeStr_7161
    private _anchor: IWindow | null;

    /** Derived name — `_SafeStr_7781`: the `habbicon_menu` container the window is parented into. */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::_SafeStr_7781
    private _container: IWindowContainer | null;

    /** Derived name — `_SafeStr_4831`. */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::_SafeStr_4831
    private _sectionList: IItemListWindow | null = null;

    /** Derived name — `_SafeStr_6261`: the section container lifted out of the layout. */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::_SafeStr_6261
    private _sectionTemplate: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_4880`. */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::_SafeStr_4880
    private _searchInput: ITextFieldWindow | null = null;

    /** Derived name — `_SafeStr_5810`. */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::_SafeStr_5810
    private _searchPlaceholder: ITextWindow | null = null;

    /** Derived name — `_SafeStr_5831`. */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::_SafeStr_5831
    private _searchClearButton: IWindow | null = null;

    /** Derived name — `_SafeStr_6286`. */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::_SafeStr_6286
    private _openHubButton: IWindow | null = null;

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::_emptyView
    private _emptyView: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_4701`: the section model. */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::_SafeStr_4701
    private _sections: HabbiconSelectorSection[] = [];

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::_ownedSearchEntries
    private _ownedSearchEntries: HabbiconSelectorEntry[] = [];

    /** Derived name — `_SafeStr_5688`: habbicon id → entry, so sections can share entry objects. */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::_SafeStr_5688
    private _entriesById: Map<number, HabbiconSelectorEntry> = new Map();

    /** Derived name — `_SafeStr_5260`: the local recency list — see class doc. */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::_SafeStr_5260
    private _recentHabbiconIds: number[] = [];

    /** Derived name — `_SafeStr_6649`: habbicon-slot window → its entry. */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::_SafeStr_6649
    private _entriesByWindow: Map<IWindowContainer, HabbiconSelectorEntry> = new Map();

    /** Derived name — `_SafeStr_7063`: every grid slot window, filler tiles included. */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::_SafeStr_7063
    private _slotWindows: Set<IWindowContainer> = new Set();

    /** Derived name — `_SafeStr_5563`: the section model must be rebuilt. Starts dirty. */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::_SafeStr_5563
    private _sectionsDirty: boolean = true;

    /** Derived name — `_SafeStr_5172`: the views must be laid out again. Starts dirty. */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::_SafeStr_5172
    private _layoutDirty: boolean = true;

    /** Derived name — `_SafeStr_6607`: a recent-list change arrived while the menu was open. */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::_SafeStr_6607
    private _recentUpdateDeferred: boolean = false;

    /** Derived name — `_SafeStr_8104`: the query the current layout was built for. */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::_SafeStr_8104
    private _lastQuery: string | null = null;

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::HabbiconSelector()
    constructor(chatInputView: RoomChatInputView, anchor: IWindow, container: IWindowContainer)
    {
        this._chatInputView = chatInputView;
        this._controller = chatInputView.widget?.roomUi ? chatInputView.widget.roomUi.habbiconController : null;
        this._anchor = anchor;
        this._container = container;

        const window = chatInputView.widget?.windowManager.buildWidgetLayout('habbiconselector_menu_xml') ?? null;

        if(window === null) return;

        this._window = window as IWindowContainer;
        this._window.visible = false;
        this._container.addChild(this._window);

        this._sectionList = this._window.findChildByName('habbicon_section_list') as IItemListWindow | null;

        const template = this._sectionList?.getListItemByName('habbicon_section_template') ?? null;

        this._sectionTemplate = template !== null
            ? (this._sectionList!.removeListItem(template) as IWindowContainer | null)
            : null;

        this._searchInput = this._window.findChildByName('habbicon_search_input') as ITextFieldWindow | null;
        this._searchPlaceholder = this._window.findChildByName('habbicon_search_placeholder') as ITextWindow | null;
        this._searchClearButton = this._window.findChildByName('habbicon_search_clear_button');
        this._openHubButton = this._window.findChildByName('habbicon_open_hub_button');
        this._emptyView = this._window.findChildByName('empty_view') as IWindowContainer | null;

        this._searchInput?.addEventListener('WE_CHANGE', this.onSearchChanged);
        this._searchInput?.addEventListener('WKE_KEY_DOWN', this.onSearchKeyDown as never);
        this._searchPlaceholder?.addEventListener('WME_DOWN', this.onSearchPlaceholderDown as never);
        this._searchClearButton?.addEventListener('WME_CLICK', this.onSearchClearClicked as never);
        this._openHubButton?.addEventListener('WME_CLICK', this.onOpenHubClicked as never);

        if(this._controller !== null)
        {
            this._controller.addEventListener(HabbiconControllerEvent.OWNED_HABBICONS_UPDATED, this.onControllerDataUpdated);
            this._controller.addEventListener(HabbiconControllerEvent.SHOP_DATA_UPDATED, this.onControllerDataUpdated);
            this._controller.addEventListener(HabbiconControllerEvent.RECENT_HABBICONS_UPDATED, this.onRecentHabbiconsUpdated);
        }

        this.setSearchState(false);
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::isWindowInTree()
    private static isWindowInTree(window: IWindow | null, root: IWindow | null): boolean
    {
        let current = window;

        while(current !== null)
        {
            if(current === root) return true;

            current = current.parent;
        }

        return false;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::seededColor()
    private static seededColor(seed: number): number
    {
        switch(seed % 6)
        {
            case 0: return 16371247;
            case 1: return 15964719;
            case 2: return 15695663;
            case 3: return 9358143;
            case 4: return 5095656;
            default: return 12813557;
        }
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::dispose()
    public dispose(): void
    {
        if(this._controller !== null)
        {
            this._controller.removeEventListener(HabbiconControllerEvent.OWNED_HABBICONS_UPDATED, this.onControllerDataUpdated);
            this._controller.removeEventListener(HabbiconControllerEvent.SHOP_DATA_UPDATED, this.onControllerDataUpdated);
            this._controller.removeEventListener(HabbiconControllerEvent.RECENT_HABBICONS_UPDATED, this.onRecentHabbiconsUpdated);
            this._controller = null;
        }

        if(this._searchInput !== null)
        {
            this._searchInput.removeEventListener('WE_CHANGE', this.onSearchChanged);
            this._searchInput.removeEventListener('WKE_KEY_DOWN', this.onSearchKeyDown as never);
            this._searchInput = null;
        }

        if(this._searchPlaceholder !== null)
        {
            this._searchPlaceholder.removeEventListener('WME_DOWN', this.onSearchPlaceholderDown as never);
            this._searchPlaceholder = null;
        }

        if(this._searchClearButton !== null)
        {
            this._searchClearButton.removeEventListener('WME_CLICK', this.onSearchClearClicked as never);
            this._searchClearButton = null;
        }

        if(this._openHubButton !== null)
        {
            this._openHubButton.removeEventListener('WME_CLICK', this.onOpenHubClicked as never);
            this._openHubButton = null;
        }

        this.clearSections();

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }

        this._sectionList = null;
        this._sectionTemplate = null;
        this._ownedSearchEntries = [];
        this._entriesById = new Map();
        this._anchor = null;
        this._container = null;
        this._chatInputView = null;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::get disposed()
    public get disposed(): boolean
    {
        return this._window === null;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::get visible()
    public get visible(): boolean
    {
        return this._window !== null && Boolean(this._window.visible);
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::toggle()
    public toggle(): void
    {
        if(this._window === null) return;

        if(this._window.visible)
        {
            this.hide();

            return;
        }

        this._window.visible = true;

        if(this._window.visible)
        {
            this.applyDeferredRecentSectionUpdate();
            this.renderIfDirty();
            this.alignToAnchor();
            this.focusSearch();
        }
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::hide()
    public hide(resetUnseen: boolean = true): void
    {
        if(this._window !== null && this._window.visible)
        {
            this._window.visible = false;

            if(resetUnseen && this._controller !== null)
            {
                this._controller.resetUnseenHabbicons();
                this.invalidateLayout();
            }
        }
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::containsWindow()
    public containsWindow(window: IWindow | null): boolean
    {
        return HabbiconSelector.isWindowInTree(window, this._window);
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::focusSearch()
    public focusSearch(): void
    {
        this._searchInput?.focus();
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::alignToAnchor()
    public alignToAnchor(): void
    {
        if(this._window === null || !this._window.visible || this._anchor === null || this._window.parent === null) return;

        const anchorRect = {x: 0, y: 0, width: 0, height: 0};

        this._anchor.getGlobalRectangle(anchorRect);

        const popupParent = this._window.parent as IWindowContainer;

        popupParent.x = anchorRect.x;
        popupParent.y = anchorRect.y + anchorRect.height - HabbiconSelector.CHAT_BAR_POPUP_OFFSET - this._window.height;

        const globalPosition = {x: 0, y: 0};

        popupParent.getGlobalPosition(globalPosition);

        if(globalPosition.x < HabbiconSelector.SCREEN_LEFT_BORDER)
        {
            popupParent.x += HabbiconSelector.SCREEN_LEFT_BORDER - globalPosition.x;
        }

        if(popupParent.y < 0)
        {
            popupParent.y = 0;
        }
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::onControllerDataUpdated()
    private onControllerDataUpdated = (): void =>
    {
        this.invalidateSections();

        if(this._window !== null && this._window.visible)
        {
            this.renderIfDirty();
            this.alignToAnchor();
        }
    };

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::onRecentHabbiconsUpdated()
    private onRecentHabbiconsUpdated = (event: HabbiconControllerEvent): void =>
    {
        if(!this.addRecentHabbicon(event.habbiconId)) return;

        if(this._window !== null && this._window.visible)
        {
            this._recentUpdateDeferred = true;

            return;
        }

        if(this._sectionsDirty) return;

        const previousIndex = this.recentSectionIndex();

        if(!this.refreshRecentSectionState()) return;

        if(this._window === null || !this._window.visible || this.normalizedQuery().length > 0)
        {
            this._layoutDirty = true;

            return;
        }

        this.renderRecentSection(previousIndex);
        this.alignToAnchor();
    };

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::applyDeferredRecentSectionUpdate()
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

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::invalidateSections()
    private invalidateSections(): void
    {
        this._sectionsDirty = true;
        this._layoutDirty = true;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::invalidateLayout()
    private invalidateLayout(): void
    {
        this._layoutDirty = true;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::renderIfDirty()
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

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::refreshSections()
    private refreshSections(): void
    {
        const favorites: HabbiconSelectorEntry[] = [];

        this._sections = [];
        this._ownedSearchEntries = [];
        this._entriesById = new Map();

        if(this._controller === null) return;

        this.syncRecentHabbiconIds();

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
            this._sections.push(new HabbiconSelectorSection(
                HabbiconSelector.SECTION_FAVORITES,
                HabbiconSelector.SECTION_FAVORITES,
                this.localize('habbicons.favourites.title', 'Favorites'),
                favorites
            ));
        }

        if(recent.length > 0)
        {
            this._sections.push(new HabbiconSelectorSection(
                HabbiconSelector.SECTION_RECENT,
                HabbiconSelector.SECTION_RECENT,
                this.localize('habbicon.recently.used', 'Recently used'),
                recent
            ));
        }

        this.addOwnedSetSections();
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::addOwnedSetSections()
    private addOwnedSetSections(): void
    {
        if(this._controller === null || !this._controller.hasLoadedShopData) return;

        for(const collection of this._controller.shopCollections)
        {
            if(collection == null) continue;

            const entries: HabbiconSelectorEntry[] = [];

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
                this._sections.push(new HabbiconSelectorSection(
                    HabbiconSelector.SECTION_COLLECTION,
                    `${HabbiconSelector.SECTION_COLLECTION}:${collection.collectionId}`,
                    this.resolveCollectionTitle(collection),
                    entries
                ));
            }
        }
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::buildRecentEntries()
    private buildRecentEntries(): HabbiconSelectorEntry[]
    {
        const entries: HabbiconSelectorEntry[] = [];

        for(const habbiconId of this._recentHabbiconIds)
        {
            const entry = this._entriesById.get(habbiconId) ?? null;

            if(entry !== null)
            {
                entries.push(entry);
            }
        }

        return entries;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::refreshRecentSectionState()
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

        this._sections.splice(this.recentInsertIndex(), 0, new HabbiconSelectorSection(
            HabbiconSelector.SECTION_RECENT,
            HabbiconSelector.SECTION_RECENT,
            this.localize('habbicon.recently.used', 'Recently used'),
            recent
        ));

        return true;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::renderRecentSection()
    private renderRecentSection(previousIndex: number): void
    {
        if(this._sectionList === null || this._emptyView === null) return;

        const newIndex = this.recentSectionIndex();
        const scroll = Number(this._sectionList.scrollV);

        if(previousIndex >= 0 && previousIndex < this._sectionList.numListItems)
        {
            const removed = this._sectionList.removeListItemAt(previousIndex);

            removed?.dispose();
        }

        if(newIndex >= 0)
        {
            this.addSectionAt(newIndex, this._sections[newIndex]);
        }

        this._emptyView.visible = this._sections.length === 0;
        this.updateHeight();
        this._sectionList.scrollV = scroll;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::recentSectionIndex()
    private recentSectionIndex(): number
    {
        for(let index = 0; index < this._sections.length; index++)
        {
            if(this._sections[index].type === HabbiconSelector.SECTION_RECENT)
            {
                return index;
            }
        }

        return -1;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::recentInsertIndex()
    private recentInsertIndex(): number
    {
        const first = this._sections.length > 0 ? this._sections[0] : null;

        return first != null && first.type === HabbiconSelector.SECTION_FAVORITES ? 1 : 0;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::sameEntries()
    private sameEntries(a: HabbiconSelectorEntry[] | null, b: HabbiconSelectorEntry[] | null): boolean
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

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::createEntry()
    private createEntry(owned: OwnedHabbiconData): HabbiconSelectorEntry | null
    {
        const state = owned.habbiconState;

        if(state !== 2 && state !== 3)
        {
            return null;
        }

        const name = this.resolveEntryName(owned.habbiconId);

        return new HabbiconSelectorEntry(owned.habbiconId, name, HabbiconSelector.seededColor(owned.habbiconId * 37), state === 3);
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::resolveEntryName()
    private resolveEntryName(habbiconId: number): string
    {
        const key = HabbiconAssetManager.getHabbiconNameKey(habbiconId);

        return key != null && key.length > 0 ? this.localize(`habbicon_${key}_name`, key) : 'Habbicon';
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::resolveCollectionTitle()
    private resolveCollectionTitle(collection: {name: string | null}): string
    {
        if(collection.name == null || collection.name.length === 0)
        {
            return 'Habbicons';
        }

        return this.localize(`habbicon_collection_${collection.name}_name`, collection.name);
    }

    /**
     * AS3 tests the result for null; this port's `getLocalizationWithParams()` never returns null
     * (see `project_getstring_never_null`), so the length test is what carries the fallback.
     */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::localize()
    private localize(key: string, fallback: string): string
    {
        const localization = this._chatInputView !== null && this._chatInputView.widget !== null
            ? this._chatInputView.widget.localizations
            : null;
        const value = localization !== null && localization !== undefined
            ? localization.getLocalizationWithParams(key, fallback)
            : fallback;

        return value != null && value.length > 0 ? value : fallback;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::sortEntries()
    private sortEntries(entries: HabbiconSelectorEntry[]): void
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

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::refresh()
    private refresh(query: string | null = null): void
    {
        this.clearSections();

        const normalizedQuery = query ?? this.normalizedQuery();

        this.setSearchState(normalizedQuery.length > 0);

        if(normalizedQuery.length > 0)
        {
            const found = this.addSearchResultsSection(normalizedQuery);

            if(this._emptyView !== null) this._emptyView.visible = found === 0;

            this.updateHeight();

            return;
        }

        let count = 0;

        for(const section of this._sections)
        {
            this.addSection(new HabbiconSelectorSection(section.type, section.key, section.title, section.entries));
            count++;
        }

        if(this._emptyView !== null) this._emptyView.visible = count === 0;

        this.updateHeight();
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::addSearchResultsSection()
    private addSearchResultsSection(query: string): number
    {
        const matches = this._ownedSearchEntries.filter((entry) => entry.searchName.indexOf(query) >= 0);

        if(matches.length === 0) return 0;

        this.addSection(new HabbiconSelectorSection(
            HabbiconSelector.SECTION_SEARCH, HabbiconSelector.SECTION_SEARCH, this.localize('habbicon.search.results', 'Search results'), matches
        ));

        return 1;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::clearSections()
    private clearSections(): void
    {
        if(this._sectionList === null) return;

        this._entriesByWindow = new Map();
        this._slotWindows = new Set();

        while(this._sectionList.numListItems > 0)
        {
            const removed = this._sectionList.removeListItemAt(0);

            removed?.dispose();
        }
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::addSection()
    private addSection(section: HabbiconSelectorSection): void
    {
        this._sectionList?.addListItem(this.createSectionWindow(section));
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::addSectionAt()
    private addSectionAt(index: number, section: HabbiconSelectorSection): void
    {
        this._sectionList?.addListItemAt(this.createSectionWindow(section), index);
    }

    /**
     * Builds a titled band as a 5-column grid, padded to whole rows (`ceil(entries / 5) * 5`
     * slots) so a partial last row keeps the section's shape. A filler slot gets the dimmer
     * background, no tooltip, no click/hover listeners and a mouse threshold of 10 so a drag
     * across it does not read as a click.
     */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::createSectionWindow()
    private createSectionWindow(section: HabbiconSelectorSection): IWindowContainer
    {
        const sectionWindow = this._sectionTemplate!.clone() as IWindowContainer;

        (sectionWindow as unknown as IWindow).visible = true;

        const titleWindow = sectionWindow.findChildByName('section_title') as ITextWindow | null;

        if(titleWindow !== null) titleWindow.caption = section.title;

        const grid = sectionWindow.findChildByName('habbicon_grid') as IItemGridWindow | null;

        if(grid === null) return sectionWindow;

        const itemTemplate = grid.getGridItemAt(0) as IWindowContainer | null;

        grid.removeGridItems();

        const entryCount = section.entries.length;
        const rows = Math.max(1, Math.ceil(entryCount / HabbiconSelector.GRID_COLUMNS));
        const slots = rows * HabbiconSelector.GRID_COLUMNS;

        for(let index = 0; index < slots; index++)
        {
            if(itemTemplate === null) break;

            const entry = index < entryCount ? section.entries[index] : null;
            const slot = itemTemplate.clone() as IRegionWindow;

            slot.toolTipCaption = entry !== null ? entry.name : '';
            this.addWheelListeners(slot as unknown as IWindow);

            const icon = slot.findChildByName('habbicon_icon') as IBitmapWrapperWindow | null;

            if(icon !== null)
            {
                this.addWheelListeners(icon as unknown as IWindow);

                // TS-only: never close() the old bitmap — it may still be the asset manager's
                // shared cache (see `HabbiconAssetManager`/`MessengerHabbiconPickerTileView`).
                if(icon.bitmap !== null) icon.bitmap = null;

                if(entry !== null)
                {
                    this.setSlotIcon(icon, entry);
                    (icon as unknown as IWindow).visible = true;
                    (icon as unknown as IWindow).invalidate();
                }
                else
                {
                    (icon as unknown as IWindow).visible = false;
                }
            }

            if(entry !== null)
            {
                slot.addEventListener(WindowMouseEvent.CLICK, this.onHabbiconClicked as never);
                slot.addEventListener(WindowMouseEvent.OVER, this.onHabbiconHovered as never);
                slot.addEventListener(WindowMouseEvent.OUT, this.onHabbiconOut as never);
            }

            (slot as unknown as IWindow).mouseThreshold = entry !== null ? 0 : 10;

            const background = slot.findChildByName('habbicon_item_bg');

            if(background !== null)
            {
                this.addWheelListeners(background);
                background.color = entry !== null ? HabbiconSelector.SLOT_FILLED_COLOR : HabbiconSelector.SLOT_EMPTY_COLOR;
            }

            if(entry !== null && this.isUnseen(entry.habbiconId))
            {
                const counter = this._chatInputView?.widget?.windowManager.createUnseenItemCounter() ?? null;

                if(counter !== null)
                {
                    const countLabel = counter.findChildByName('count') as ITextWindow | null;

                    if(countLabel !== null) countLabel.caption = '1';

                    counter.x = (slot as unknown as IWindow).width - counter.width - 1;
                    counter.y = 1;

                    (slot as unknown as IWindowContainer).addChild(counter);
                }
            }

            grid.addGridItem(slot);
            this._slotWindows.add(slot as unknown as IWindowContainer);

            if(entry !== null) this._entriesByWindow.set(slot as unknown as IWindowContainer, entry);
        }

        grid.height = rows * HabbiconSelector.SLOT_SIZE + (rows - 1) * HabbiconSelector.SLOT_SPACING;
        (sectionWindow as unknown as IWindow).height = HabbiconSelector.TITLE_HEIGHT + grid.height + HabbiconSelector.SLOT_SPACING;

        itemTemplate?.dispose();

        return sectionWindow;
    }

    /**
     * The preview comes straight out of the asset manager's cache. If the spritesheet has not
     * loaded yet, AS3 draws a solid seeded-color square synchronously; this port shows the icon
     * empty for one frame and paints the (cached, async) color placeholder once it resolves.
     */
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::createHabbiconBitmap()
    private setSlotIcon(icon: IBitmapWrapperWindow, entry: HabbiconSelectorEntry): void
    {
        const preview = HabbiconAssetManager.getPreviewBitmap(entry.habbiconId, false);

        if(preview !== null)
        {
            icon.bitmap = preview;

            return;
        }

        void HabbiconSelector.getColorPlaceholder(entry.color).then((placeholder) =>
        {
            if(this._window === null) return;

            icon.bitmap = placeholder;
            (icon as unknown as IWindow).invalidate();
        });
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::updateHeight()
    private updateHeight(): void
    {
        if(this._window === null || this._sectionList === null) return;

        const contentHeight = Math.trunc(this._sectionList.scrollableRegion.height);
        const available = HabbiconSelector.MENU_MAX_HEIGHT - HabbiconSelector.TOP_BAR_HEIGHT - HabbiconSelector.BOTTOM_PADDING;
        const listHeight = Math.min(Math.max(HabbiconSelector.SECTION_LIST_MIN_HEIGHT, contentHeight + 2), available);

        this._sectionList.height = listHeight;
        this._window.height = Math.max(HabbiconSelector.MENU_MIN_HEIGHT, HabbiconSelector.TOP_BAR_HEIGHT + listHeight + HabbiconSelector.BOTTOM_PADDING);
        this._window.invalidate();
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::normalizedQuery()
    private normalizedQuery(): string
    {
        const text = this._searchInput?.text ?? null;

        return text != null ? text.toLowerCase() : '';
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::onSearchPlaceholderDown()
    private onSearchPlaceholderDown = (): void =>
    {
        this._searchInput?.focus();
    };

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::onSearchChanged()
    private onSearchChanged = (): void =>
    {
        this.invalidateLayout();
        this.renderIfDirty();
        this.alignToAnchor();
    };

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::onSearchKeyDown()
    private onSearchKeyDown = (event: WindowKeyboardEvent): void =>
    {
        if(event.keyCode !== HabbiconSelector.KEY_ESCAPE || (this._searchInput?.text.length ?? 0) === 0) return;

        this.clearSearch();
    };

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::onSearchClearClicked()
    private onSearchClearClicked = (): void =>
    {
        this.clearSearch();
    };

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::clearSearch()
    private clearSearch(): void
    {
        if(this._searchInput !== null) this._searchInput.text = '';

        this.invalidateLayout();
        this.renderIfDirty();
        this.alignToAnchor();
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::onOpenHubClicked()
    private onOpenHubClicked = (): void =>
    {
        this._chatInputView?.openHabbiconHub();
        this.hide();
    };

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::onHabbiconClicked()
    private onHabbiconClicked = (event: WindowMouseEvent): void =>
    {
        const entry = this.resolveEntry(event.window);

        if(entry === null) return;

        if(this._controller !== null)
        {
            this._controller.removeUnseenHabbicon(entry.habbiconId);
            this._controller.noteHabbiconUsed(entry.habbiconId);
        }
        else if(this.addRecentHabbicon(entry.habbiconId))
        {
            this._recentUpdateDeferred = true;
        }

        this.sendTriggerHabbicon(entry.habbiconId);

        if(!event.shiftKey) this.hide(false);
    };

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::sendTriggerHabbicon()
    private sendTriggerHabbicon(habbiconId: number): void
    {
        this._chatInputView?.widget?.handler.container?.connection?.send(new TriggerHabbiconMessageComposer(habbiconId));
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::isUnseen()
    private isUnseen(habbiconId: number): boolean
    {
        return this._controller !== null && this._controller.isUnseenHabbicon(habbiconId);
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::syncRecentHabbiconIds()
    private syncRecentHabbiconIds(): void
    {
        if(this._controller === null) return;

        this._recentHabbiconIds = [...this._controller.recentHabbiconIds];
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::addRecentHabbicon()
    private addRecentHabbicon(habbiconId: number): boolean
    {
        const index = this._recentHabbiconIds.indexOf(habbiconId);

        if(habbiconId <= 0 || index === 0) return false;

        if(index >= 0) this._recentHabbiconIds.splice(index, 1);

        this._recentHabbiconIds.unshift(habbiconId);

        if(this._recentHabbiconIds.length > HabbiconSelector.RECENT_LIMIT)
        {
            this._recentHabbiconIds.length = HabbiconSelector.RECENT_LIMIT;
        }

        return true;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::addWheelListeners()
    private addWheelListeners(window: IWindow | null): void
    {
        if(window === null) return;

        window.addEventListener(WindowMouseEvent.WHEEL, this.onSelectorWheel as never);
        window.addEventListener(WindowMouseEvent.WHEEL_HORIZONTAL, this.onSelectorWheel as never);
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::onSelectorWheel()
    private onSelectorWheel = (event: WindowMouseEvent): void =>
    {
        if(this._sectionList === null) return;

        const horizontal = event.type === WindowMouseEvent.WHEEL_HORIZONTAL;
        const delta = horizontal ? -event.delta : event.delta;

        if(this._sectionList.scrollWithWheel(delta, horizontal || event.shiftKey))
        {
            event.stopPropagation();
        }
    };

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::onHabbiconHovered()
    private onHabbiconHovered = (event: WindowMouseEvent): void =>
    {
        const slot = this.resolveHabbiconWindow(event.window);

        if(slot === null) return;

        const background = slot.findChildByName('habbicon_item_bg');

        if(background !== null) background.color = HabbiconSelector.SLOT_FILLED_HOVER_COLOR;
    };

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::onHabbiconOut()
    private onHabbiconOut = (event: WindowMouseEvent): void =>
    {
        const slot = this.resolveHabbiconWindow(event.window);

        if(slot === null) return;

        const background = slot.findChildByName('habbicon_item_bg');

        if(background !== null)
        {
            background.color = this._entriesByWindow.has(slot) ? HabbiconSelector.SLOT_FILLED_COLOR : HabbiconSelector.SLOT_EMPTY_COLOR;
        }
    };

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::resolveEntry()
    private resolveEntry(window: IWindow | null): HabbiconSelectorEntry | null
    {
        const slot = this.resolveHabbiconWindow(window);

        return slot !== null ? this._entriesByWindow.get(slot) ?? null : null;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::resolveHabbiconWindow()
    private resolveHabbiconWindow(window: IWindow | null): IWindowContainer | null
    {
        let current: IWindow | null = window;

        while(current !== null)
        {
            if(this._slotWindows.has(current as unknown as IWindowContainer))
            {
                return current as unknown as IWindowContainer;
            }

            current = current.parent;
        }

        return null;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelector.as::setSearchState()
    private setSearchState(searching: boolean): void
    {
        if(this._searchPlaceholder !== null) (this._searchPlaceholder as unknown as IWindow).visible = !searching;
        if(this._searchClearButton !== null) this._searchClearButton.visible = searching;
    }
}
