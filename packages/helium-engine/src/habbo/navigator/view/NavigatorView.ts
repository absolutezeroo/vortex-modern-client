import {Logger} from '@core/utils/Logger';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ITabContextWindow} from '@core/window/components/ITabContextWindow';
import type {ITabButtonWindow} from '@core/window/components/ITabButtonWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {HabboNewNavigator} from '../HabboNewNavigator';
import type {NavigatorSearchResultSet} from '../../communication/messages/incoming/newnavigator';
import type {NavigatorSavedSearch} from '../../communication/messages/incoming/newnavigator/NavigatorSavedSearch';
import type {GuestRoomData} from '../../communication/messages/incoming/navigator/GuestRoomData';
import {getViewMode} from './ViewMode';
import {SearchView} from './search/SearchView';
import {BlockResultsView} from './search/results/BlockResultsView';
import {CategoryElementFactory} from './search/results/CategoryElementFactory';
import {RoomEntryElementFactory} from './search/results/RoomEntryElementFactory';
import {TopViewSelector} from './TopViewSelector';
import {QuickLinksView} from './QuickLinksView';
import {LiftView} from './LiftView';
import {RoomInfoPopup} from './RoomInfoPopup';
import {IUpdateReceiver} from "@core";

const log = Logger.getLogger('NavigatorView');

const LAYOUT_NAME = 'navigator_frame_2';
const MAX_WINDOW_WIDTH = 578;
const STARTING_TAB_POSITION = 115;
const LEFT_PANE_MARGIN_CONST = 7;

/**
 * Navigator view — manages the navigator window via the window manager.
 *
 * Builds the navigator window tree from the registered layout asset
 * using `windowManager.buildWidgetLayout()` (equivalent to AS3's
 * `windowManager.buildFromXML()`). Creates sub-views for search,
 * results, tabs, quick links, and room info popup.
 *
 * @see sources/win63_version/habbo/navigator/view/NavigatorView.as
 */
export class NavigatorView implements IUpdateReceiver
{
	private _navigator: HabboNewNavigator;
	private _window: IWindowContainer | null = null;
	private _searchView: SearchView | null = null;
	private _blockResultsView: BlockResultsView | null = null;
	private _roomEntryElementFactory: RoomEntryElementFactory | null = null;
	private _categoryElementFactory: CategoryElementFactory | null = null;
	private _topViewSelector: TopViewSelector | null = null;
	private _quickLinksView: QuickLinksView | null = null;
	private _liftView: LiftView | null = null;
	private _roomInfoPopup: RoomInfoPopup | null = null;
	private _lastWindowX: number = -1;
	private _lastWindowY: number = -1;
	private _lastWindowWidth: number = -1;
	private _lastWindowHeight: number = -1;
	private _lastLeftPaneHidden: boolean = false;
	private _waitingForGroupDetails: number = -1;
	private _popupHideDelay: number = 4000;
	private _lastPreferencesSaveTime: number = 0;
	private _rightPane: IWindow | null = null;
	private _rightPaneOriginalX: number = 0;
	private _leftPaneMarginConst: number = LEFT_PANE_MARGIN_CONST;
	private _leftPaneMargin: number = 0;
	private _roomInfoGlobalRectangle: { x: number; y: number; width: number; height: number } = { x: 0, y: 0, width: 0, height: 0 };

	constructor(navigator: HabboNewNavigator)
	{
		this._navigator = navigator;
	}

	private _disposed: boolean = false;

	/**
	 * Whether this struct has been disposed
	 */
	get disposed(): boolean
	{
		return this._disposed;
	}

	// State
	private _isBusy: boolean = false;

	get isBusy(): boolean
	{
		return this._isBusy;
	}

	/**
	 * Set busy state (show loading indicator).
	 *
	 * @see sources/win63_version/habbo/navigator/view/NavigatorView.as set isBusy()
	 */
	set isBusy(value: boolean)
	{
		if (this._window)
		{
			this._window.caption = value ? '${navigator.title.is.busy}' : '${navigator.title}';

			const mask = this._window.findChildByName('search_waiting_for_results_mask');

			if (mask)
			{
				mask.visible = value;
			}
		}

		this._isBusy = value;
	}

	/**
	 * Whether the navigator window is visible.
	 *
	 * @see sources/win63_version/habbo/navigator/view/NavigatorView.as get visible()
	 */
	get visible(): boolean
	{
		if (this._window)
		{
			return this._window.visible;
		}

		return false;
	}

	get mainWindow(): IWindow | null
	{
		return this._window;
	}

	/**
	 * Show or hide the navigator window.
	 *
	 * On first show, creates sub-views and the window via buildWidgetLayout().
	 * If showing, triggers a search if no results exist yet.
	 *
	 * @see sources/win63_version/habbo/navigator/view/NavigatorView.as set visible()
	 */
	set visible(value: boolean)
	{
		if (value && this._navigator.isReady)
		{
			if (this._roomEntryElementFactory === null)
			{
				this._roomEntryElementFactory = new RoomEntryElementFactory(this._navigator);
			}

			if (this._categoryElementFactory === null)
			{
				this._categoryElementFactory = new CategoryElementFactory(this._navigator, this._roomEntryElementFactory);
			}

			this.createSubViews();

			if (this._window === null)
			{
				this.createMainWindow();

				if (this._quickLinksView)
				{
					this._quickLinksView.setQuickLinks(this._navigator.contextContainer.savedSearches);
				}
			}

			if (this._navigator.currentResults !== null)
			{
				this.onSearchResults(this._navigator.currentResults);
			}
			else if (!this._isBusy)
			{
				this._navigator.performSearch('official_view');
			}

			if (this._window)
			{
				this._window.activate();
			}
		}
		else if (this._roomInfoPopup)
		{
			this._roomInfoPopup.show(false);
		}

		if (this._window)
		{
			this._window.visible = value;
		}
	}

	/**
	 * Whether the room info popup is currently visible.
	 *
	 * @see sources/win63_version/habbo/navigator/view/NavigatorView.as get isRoomInfoBubbleVisible()
	 */
	get isRoomInfoBubbleVisible(): boolean
	{
		if (this._roomInfoPopup)
		{
			return this._roomInfoPopup.visible;
		}

		return false;
	}

	/**
	 * Check if window position/size has changed since last save.
	 *
	 * @see sources/win63_version/habbo/navigator/view/NavigatorView.as get windowPreferencesChanged()
	 */
	private get windowPreferencesChanged(): boolean
	{
		if(!this._window) return false;

		const leftPane = this._window.findChildByName('left_pane');

		if(leftPane && this._lastLeftPaneHidden !== leftPane.visible) return true;
		if(this._lastWindowX !== this._window.x) return true;
		if(this._lastWindowY !== this._window.y) return true;
		if(this._lastWindowHeight !== this._window.height) return true;

		return false;
	}

	/**
	 * Update loop — saves window preferences and auto-hides room info popup.
	 *
	 * @see sources/win63_version/habbo/navigator/view/NavigatorView.as update()
	 */
	update(deltaTime: number): void
	{
		if(!this._window) return;

		const now = performance.now();

		// Save window preferences if changed (every 5 seconds)
		if(this.windowPreferencesChanged && now - this._lastPreferencesSaveTime > 5000)
		{
			this.sendWindowPreferences();
		}

		// Keep window inside screen
		this.keepWindowInsideScreenRegion();

		// Auto-hide room info popup after delay
		this._popupHideDelay -= deltaTime;

		if(this.isRoomInfoBubbleVisible && this._popupHideDelay < 0)
		{
			this._roomInfoPopup!.getGlobalRectangle(this._roomInfoGlobalRectangle);

			const desktop = this._window.desktop as unknown as { mouseX?: number; mouseY?: number } | null;
			const mouseX = desktop?.mouseX ?? 0;
			const mouseY = desktop?.mouseY ?? 0;
			const rect = this._roomInfoGlobalRectangle;
			const inside = mouseX >= rect.x
				&& mouseX <= (rect.x + rect.width)
				&& mouseY >= rect.y
				&& mouseY <= (rect.y + rect.height);

			if(!inside)
			{
				this._roomInfoPopup!.show(false);
			}
		}
	}

	/**
	 * Get the current text in the search input.
	 *
	 * @see sources/win63_version/habbo/navigator/view/NavigatorView.as currentFilterText()
	 */
	currentFilterText(): string
	{
		if (this._searchView)
		{
			return this._searchView.currentInput;
		}

		return '';
	}

	/**
	 * Show the room info bubble at a position.
	 *
	 * @param roomData - The room data to display
	 * @param x - The x position
	 * @param y - The y position
	 * @param isUpdate - Whether this is an update to an existing bubble
	 *
	 * @see sources/win63_version/habbo/navigator/view/NavigatorView.as showRoomInfoBubbleAt()
	 */
	showRoomInfoBubbleAt(roomData: GuestRoomData, x: number, y: number, isUpdate: boolean = false): void
	{
		if (!this._window) return;

		if (!this._roomInfoPopup)
		{
			this._roomInfoPopup = new RoomInfoPopup(this._navigator);
		}

		if (this._roomInfoPopup.visible && !isUpdate)
		{
			this._roomInfoPopup.show(false);
		}
		else
		{
			this._roomInfoPopup.setData(roomData);

			if (roomData.habboGroupId !== 0 && this._navigator.getCachedGroupDetails(roomData.habboGroupId) == null)
			{
				this._navigator.getGuildInfo(roomData.habboGroupId, false);
				this._waitingForGroupDetails = roomData.habboGroupId;
			}

			this._roomInfoPopup.showAt(true, x, y);
			this._navigator.trackEventLog('browse.openroominfo', 'Results', roomData.roomName, roomData.flatId);
			this._popupHideDelay = 4000;
		}
	}

	/**
	 * Called when search results arrive.
	 *
	 * Updates the view mode, renders results, selects the matching tab,
	 * and updates the search input.
	 *
	 * @see sources/win63_version/habbo/navigator/view/NavigatorView.as onSearchResults()
	 */
	onSearchResults(results: NavigatorSearchResultSet, source: string = ''): void
	{
		if (this._navigator.newResultsRendered)
		{
			return;
		}

		if (!this._roomEntryElementFactory || !this._blockResultsView)
		{
			return;
		}

		this._roomEntryElementFactory.viewMode = getViewMode(results.searchCodeOriginal);
		this._blockResultsView.displayCurrentResults();

		// Select the matching tab if this is a top-level search
		if (this._navigator.contextContainer.hasContextFor(results.searchCodeOriginal))
		{
			if (this._topViewSelector)
			{
				this._topViewSelector.selectTabByIndex(0);
			}
		}

		// Update create/promote/random buttons (AS3 lines 224-236)
		if(this._window)
		{
			const createRoom = this._window.findChildByName('create_room');

			if(createRoom)
			{
				createRoom.procedure = this.createRoomProcedure;
			}

			const randomBorder = this._window.findChildByName('random_room_border');
			const promoteBorder = this._window.findChildByName('promote_room_border');

			// AS3: both hidden first, then conditional
			if(randomBorder) randomBorder.visible = false;
			if(promoteBorder) promoteBorder.visible = false;

			if(results.searchCodeOriginal === 'roomads_view' || results.searchCodeOriginal === 'myworld_view')
			{
				if(promoteBorder) promoteBorder.visible = true;

				const promoteRoom = this._window.findChildByName('promote_room');

				if(promoteRoom)
				{
					promoteRoom.procedure = this.promoteRoomProcedure;
				}
			}
			else
			{
				if(randomBorder) randomBorder.visible = true;

				const randomRoom = this._window.findChildByName('random_room');

				if(randomRoom)
				{
					randomRoom.procedure = this.randomRoomProcedure;
				}
			}
		}

		// Update search text
		if (this._searchView)
		{
			this._searchView.setTextAndSearchModeFromFilter(results.filteringData, source);
		}

		this._navigator.newResultsRendered = true;
		this.isBusy = false;

		if (this._roomInfoPopup)
		{
			this._roomInfoPopup.show(false);
		}
	}

	/**
	 * Called when saved searches are updated.
	 *
	 * @see sources/win63_version/habbo/navigator/view/NavigatorView.as onSavedSearches()
	 */
	onSavedSearches(searches: NavigatorSavedSearch[]): void
	{
		if (this._quickLinksView)
		{
			this._quickLinksView.setQuickLinks(searches);
		}
	}

	/**
	 * Set initial window dimensions from server preferences.
	 *
	 * @see sources/win63_version/habbo/navigator/view/NavigatorView.as setInitialWindowDimensions()
	 */
	setInitialWindowDimensions(x: number, y: number, height: number, leftPaneHidden: boolean, _resultsMode: number): void
	{
		if (this._window)
		{
			this.setLeftPaneVisibility(!leftPaneHidden);
			this._window.x = x;
			this._window.y = y;
			this._window.height = height;
		}
		else
		{
			this._lastWindowX = x;
			this._lastWindowY = y;
			this._lastWindowHeight = height;
			this._lastLeftPaneHidden = leftPaneHidden;
		}
	}

	/**
	 * Refresh lifted rooms display.
	 *
	 * @see sources/win63_version/habbo/navigator/view/NavigatorView.as refreshLiftedRooms()
	 */
	refreshLiftedRooms(): void
	{
		if (this._liftView)
		{
			this._liftView.refresh();
		}
	}

	/**
	 * Handle group details arrival.
	 *
	 * @see sources/win63_version/habbo/navigator/view/NavigatorView.as onGroupDetailsArrived()
	 */
	onGroupDetailsArrived(groupId: number): void
	{
		if (this._waitingForGroupDetails === groupId)
		{
			this._waitingForGroupDetails = -1;
		}
	}

	/**
	 * Set the left pane visibility and adjust window layout.
	 *
	 * @param visible - Whether the left pane should be visible
	 *
	 * @see sources/win63_version/habbo/navigator/view/NavigatorView.as setLeftPaneVisibility()
	 */
	setLeftPaneVisibility(visible: boolean): void
	{
		if (!this._window || !this._rightPane) return;

		const leftPane = this._window.findChildByName('left_pane');

		if (!leftPane) return;

		const offset = this._rightPaneOriginalX - this._leftPaneMargin + LEFT_PANE_MARGIN_CONST;

		// Temporarily enable manual positioning
		this._rightPane.setParamFlag(0, true);
		this._rightPane.setParamFlag(128, false);

		if (!visible)
		{
			leftPane.visible = false;
			this._rightPane.x = this._leftPaneMarginConst;

			const newWidth = this._window.width - offset + this._leftPaneMarginConst;

			this._window.limits.minWidth = newWidth;
			this._window.limits.maxWidth = newWidth;
			this._window.width = newWidth;
		}
		else
		{
			leftPane.visible = true;
			this._rightPane.x = this._rightPaneOriginalX;

			const newWidth = this._window.width + offset - this._leftPaneMarginConst;
			const clampedWidth = newWidth > MAX_WINDOW_WIDTH ? MAX_WINDOW_WIDTH : newWidth;

			this._window.limits.minWidth = clampedWidth;
			this._window.limits.maxWidth = clampedWidth;
			this._window.width = clampedWidth;
		}

		// Restore auto layout
		this._rightPane.setParamFlag(0, false);
		this._rightPane.setParamFlag(128, true);

		const hideContainer = this._window.findChildByName('left_hide_container');
		const showContainer = this._window.findChildByName('left_show_container');

		if (hideContainer) hideContainer.visible = visible;
		if (showContainer) showContainer.visible = !visible;

		const tabPosition = visible ? STARTING_TAB_POSITION : STARTING_TAB_POSITION - offset / 2;
		const tabContext = this._window.findChildByName('top_view_select_tab_context');

		if (tabContext)
		{
			tabContext.x = tabPosition;
		}
	}

	/**
	 * Dispose the view and clean up.
	 *
	 * @see sources/win63_version/habbo/navigator/view/NavigatorView.as dispose()
	 */
	dispose(): void
	{
		this._navigator.removeUpdateReceiver(this);

		if(this._roomInfoPopup)
		{
			this._roomInfoPopup.dispose();
			this._roomInfoPopup = null;
		}

		if(this._liftView)
		{
			this._liftView.dispose();
			this._liftView = null;
		}

		if(this._window)
		{
			this._window.dispose();
			this._window = null;
		}
	}

	/**
	 * Create sub-views (factories, search, results, tabs, quick links).
	 *
	 * @see sources/win63_version/habbo/navigator/view/NavigatorView.as createSubViews()
	 */
	private createSubViews(): void
	{
		if (this._blockResultsView === null)
		{
			this._blockResultsView = new BlockResultsView(this._navigator);
			this._blockResultsView.categoryElementFactory = this._categoryElementFactory!;
			this._categoryElementFactory!.blockResultsView = this._blockResultsView;
		}

		if (this._searchView === null)
		{
			this._searchView = new SearchView(this._navigator);
		}

		if (this._quickLinksView === null)
		{
			this._quickLinksView = new QuickLinksView(this._navigator);
		}

		if (this._liftView === null)
		{
			// LiftView creation is skipped in AS3 (empty block), but we keep the stub
		}

		if (this._topViewSelector === null)
		{
			this._topViewSelector = new TopViewSelector(this._navigator);
		}
	}

	/**
	 * Create the main navigator window via the window manager.
	 *
	 * Builds the window tree from the layout, clones templates for reuse,
	 * and wires up event handlers for all interactive elements.
	 *
	 * @see sources/win63_version/habbo/navigator/view/NavigatorView.as createMainWindow()
	 */
	private createMainWindow(): void
	{
		const windowManager = this._navigator.windowManager;

		if (!windowManager) return;

		log.debug(`Building layout: ${LAYOUT_NAME}`);

		const built = windowManager.buildWidgetLayout(LAYOUT_NAME);

		if (!built)
		{
			log.warn(`Layout not found: ${LAYOUT_NAME}`);

			return;
		}

		const windowContainer = built as IWindowContainer;

		// --- Clone templates from the built tree ---

		// Row entry template
		const rowEntryContainer = windowContainer.findChildByName('navigator_entry_row_container') as IWindowContainer | null;

		if (rowEntryContainer && this._roomEntryElementFactory)
		{
			this._roomEntryElementFactory.rowEntryTemplate = rowEntryContainer.clone() as IWindowContainer;
			rowEntryContainer.destroy();
		}

		// Tile entry template and tile container template
		const tileContainerEl = windowContainer.findChildByName('navigator_entry_tile_container');

		if (tileContainerEl && this._roomEntryElementFactory)
		{
			const tileContainerClone = tileContainerEl.clone() as IItemListWindow;
			const tileEntry = tileContainerClone.getListItemByName?.('navigator_entry_tile');

			if (tileEntry)
			{
				this._roomEntryElementFactory.tileEntryTemplate = tileEntry.clone() as IWindowContainer;
			}

			tileContainerClone.destroyListItems();
			this._roomEntryElementFactory.tileContainerTemplate = tileContainerClone;
		}

		// AS3: sources/win63_version/habbo/navigator/view/NavigatorView.as::createMainWindow()
		// Flash clones the first block_results item, removes index 0, and repeats
		// for the collapsed and no-results templates.
		const blockResults = windowContainer.findChildByName('block_results') as IItemListWindow | null;
		const cloneNextBlockResultTemplate = (): IWindowContainer =>
		{
			const template = blockResults!.getListItemAt(0) as IWindowContainer;
			const clone = template.clone() as IWindowContainer;

			blockResults!.removeListItemAt(0);
			template.destroy();

			return clone;
		};

		// Clear category_content template items
		const categoryContent = windowContainer.findChildByName('category_content') as IItemListWindow | null;

		if (categoryContent)
		{
			categoryContent.destroyListItems();
		}

		if (blockResults && this._categoryElementFactory)
		{
			this._categoryElementFactory.categoryTemplate = cloneNextBlockResultTemplate();
			this._categoryElementFactory.collapsedCategoryTemplate = cloneNextBlockResultTemplate();
			this._categoryElementFactory.noResultsTemplate = cloneNextBlockResultTemplate();
		}

		// --- Wire sub-views to their containers ---

		// Block results list
		if (this._blockResultsView && blockResults)
		{
			this._blockResultsView.itemList = blockResults;
		}

		// Search tools container
		if (this._searchView)
		{
			const searchTools = windowContainer.findChildByName('search_tools') as IWindowContainer | null;

			if (searchTools)
			{
				this._searchView.container = searchTools;
			}
		}

		// Quick links
		if (this._quickLinksView)
		{
			const quickLink = windowContainer.findChildByName('quick_link') as IWindowContainer | null;

			if (quickLink)
			{
				const linkText = quickLink.findChildByName('quick_link_text');

				if (linkText)
				{
					linkText.caption = '';
				}

				this._quickLinksView.template = quickLink.clone() as IWindowContainer;
			}

			const quickLinksList = windowContainer.findChildByName('quicklinks_list') as IItemListWindow | null;

			if (quickLinksList)
			{
				this._quickLinksView.itemList = quickLinksList;
				quickLinksList.removeListItems();
			}

			if (quickLink)
			{
				quickLink.destroy();
			}
		}

		// Top view selector tabs
		if (this._topViewSelector)
		{
			const tabContext = windowContainer.findChildByName('top_view_select_tab_context') as ITabContextWindow | null;

			if (tabContext)
			{
				const firstTab = tabContext.getTabItemAt(0);

				if (firstTab)
				{
					const template = firstTab.clone() as ITabButtonWindow;

					this._topViewSelector.template = template;
					this._topViewSelector.tabContext = tabContext;
					tabContext.removeTabItem(template);
				}
				this._topViewSelector.refresh();
			}
		}

		// --- Wire button procedures ---

		// Store left pane margin
		const leftPaneEl = windowContainer.findChildByName('left_pane');

		if (leftPaneEl)
		{
			this._leftPaneMargin = leftPaneEl.x;
		}

		// Refresh button
		const refreshButton = windowContainer.findChildByName('refreshButton');

		if (refreshButton)
		{
			refreshButton.procedure = this.refreshSearchResults;
		}

		// Close button
		const closeButton = windowContainer.findChildByName('header_button_close');

		if (closeButton)
		{
			closeButton.procedure = this.headerProcedure;
		}

		// Left pane show/hide toggle
		this._leftPaneMarginConst = LEFT_PANE_MARGIN_CONST;

		const tempBack = windowContainer.findChildByName('temp_back');

		if (tempBack)
		{
			tempBack.procedure = this.leftPaneShowHideProcedure;
		}

		// Store right pane reference for left pane toggling
		this._rightPane = windowContainer.findChildByName('right_pane');

		if (this._rightPane)
		{
			this._rightPaneOriginalX = this._rightPane.x;
		}

		// Store window reference
		this._window = windowContainer;

		// Register update receiver for periodic preference saving and popup auto-hide
		this._navigator.registerUpdateReceiver(this, 1000);
		this._lastPreferencesSaveTime = performance.now();

		// Start with left pane hidden
		this.setLeftPaneVisibility(false);

		// Apply initial dimensions from server or use defaults
		if (this._lastWindowX === -1 && this._lastWindowY === -1)
		{
			this._lastWindowX = this._window.x;
			this._lastWindowY = this._window.y;
			this._lastWindowWidth = this._window.width;
			this._lastWindowHeight = this._window.height;
		}
		else
		{
			if (this._lastLeftPaneHidden)
			{
				this.setLeftPaneVisibility(true);
			}

			this._window.x = this._lastWindowX;
			this._window.y = this._lastWindowY;
			this._window.height = this._lastWindowHeight;
		}

		log.info(`Navigator window created: ${this._window.width}x${this._window.height} at (${this._window.x}, ${this._window.y})`);
	}

	private refreshSearchResults = (event: WindowEvent, window: IWindow): void =>
	{
		if (event.type === 'WME_CLICK' && window.name === 'refreshButton')
		{
			this._navigator.performLastSearch();
		}
	};

	private headerProcedure = (event: WindowEvent, window: IWindow): void =>
	{
		if (event.type === 'WME_CLICK')
		{
			if (window.name === 'header_button_close')
			{
				this.visible = false;
			}
		}
	};

	private createRoomProcedure = (event: WindowEvent, _window: IWindow): void =>
	{
		if(event.type === 'WME_CLICK')
		{
			this._navigator.createRoom();

			if(this._roomInfoPopup)
			{
				this._roomInfoPopup.show(false);
			}
		}
	};

	private promoteRoomProcedure = (event: WindowEvent, _window: IWindow): void =>
	{
		if(event.type === 'WME_CLICK')
		{
			this._navigator.context.createLinkEvent('catalog/open/room_ad');

			if(this._roomInfoPopup)
			{
				this._roomInfoPopup.show(false);
			}
		}
	};

	private randomRoomProcedure = (event: WindowEvent, _window: IWindow): void =>
	{
		if(event.type === 'WME_CLICK')
		{
			this._navigator.context.createLinkEvent('navigator/goto/random_friending_room');

			if(this._roomInfoPopup)
			{
				this._roomInfoPopup.show(false);
			}

			this.visible = false;
		}
	};

	private leftPaneShowHideProcedure = (event: WindowEvent, _window: IWindow): void =>
	{
		if(event.type === 'WME_CLICK')
		{
			if(this._window)
			{
				const leftPane = this._window.findChildByName('left_pane');

				if(leftPane)
				{
					this.setLeftPaneVisibility(!leftPane.visible);
				}
			}

			if(this._roomInfoPopup)
			{
				this._roomInfoPopup.show(false);
			}
		}
	};

	/**
	 * Send current window preferences to server.
	 *
	 * @see sources/win63_version/habbo/navigator/view/NavigatorView.as sendWindowPreferences()
	 */
	private sendWindowPreferences(): void
	{
		if(!this._window) return;

		this._lastWindowX = this._window.x;
		this._lastWindowY = this._window.y;
		this._lastWindowWidth = this._window.width;
		this._lastWindowHeight = this._window.height;

		const leftPane = this._window.findChildByName('left_pane');
		this._lastLeftPaneHidden = leftPane ? leftPane.visible : false;

		this._lastPreferencesSaveTime = performance.now();

		this._navigator.sendWindowPreferences(
			this._lastWindowX,
			this._lastWindowY,
			this._lastWindowWidth,
			this._lastWindowHeight,
			this._lastLeftPaneHidden,
			0
		);
		this._navigator.trackEventLog('windowsettings', 'Interface', this._window.width + ' x ' + this._window.height);
	}

	/**
	 * Keep the window inside the screen bounds.
	 *
	 * @see sources/win63_version/habbo/navigator/view/NavigatorView.as keepWindowInsideScreenRegion()
	 */
	private keepWindowInsideScreenRegion(): void
	{
		if(!this._window) return;

		this._window.x = Math.max(0, this._window.x);
		this._window.y = Math.max(0, this._window.y);

		if(this._window.desktop)
		{
			this._window.x = Math.min(this._window.desktop.width - this._window.width, this._window.x);
			this._window.y = Math.min(this._window.desktop.height - this._window.height, this._window.y);
		}
	}
}
