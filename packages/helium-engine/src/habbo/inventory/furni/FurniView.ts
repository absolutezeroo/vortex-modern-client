import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import type {FurniModel} from './FurniModel';
import type {GroupItem} from '../items/GroupItem';
import type {FurnitureItem} from '../items/FurnitureItem';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {ILimitedItemPreviewOverlayWidget} from '@habbo/window/widgets/ILimitedItemPreviewOverlayWidget';
import type {IRarityItemPreviewOverlayWidget} from '@habbo/window/widgets/IRarityItemPreviewOverlayWidget';
import type {IRoomPreviewerWidget} from '@habbo/window/widgets/IRoomPreviewerWidget';
import type {RoomPreviewer} from '@habbo/room/preview/RoomPreviewer';
import {Vector3d} from '@room/utils/Vector3d';
import {FurniGridView} from './FurniGridView';

const STATE_NULL = 0;
const STATE_INITIALIZING = 1;
const STATE_EMPTY = 2;
const STATE_CONTENT = 3;

/**
 * Furni tab content window: item grid, filters, and action buttons.
 *
 * Based on AS3 com.sulake.habbo.inventory.furni.FurniView
 *
 * Phase 1 scope (see project decision): the 3D room-preview panel
 * (RoomPreviewer) and the marketplace "sell" flow are not wired yet —
 * MarketplaceModel doesn't exist, and RoomPreviewer.ts is a stub. Both are
 * tracked as follow-up work; this view shows the grid, selection, filters,
 * and the buttons that don't depend on either (place/goto-room/trade/
 * recycle/rent), matching AS3's own null-guards for an absent marketplace.
 */
export class FurniView
{
    private _model: FurniModel;
    private _window: IWindowContainer | null = null;
    private _grid: FurniGridView | null = null;
    private _isInitialized: boolean = false;
    private _state: number = STATE_NULL;
    private _currentFilterCategory: string = '';
    private _rentablesPlacementSelection: number = 2;

    private _actionButtonList: IItemListWindow | null = null;
    private _placeInRoomButton: IWindow | null = null;
    private _extendRentButton: IWindow | null = null;
    private _buyRentedItemButton: IWindow | null = null;
    private _gotoRoomButton: IWindow | null = null;
    private _useButton: IWindow | null = null;
    private _offerInTradingCountButton: ITextFieldWindow | null = null;
    private _offerInTradingButton: IWindow | null = null;
    private _sellButton: IWindow | null = null;
    private _roomPreviewer: RoomPreviewer | null = null;

    constructor(model: FurniModel)
    {
        this._model = model;
    }

    get disposed(): boolean
    {
        return false;
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniView.as::get isVisible()
    get isVisible(): boolean
    {
        return !!this._window?.visible;
    }

    get isInitialized(): boolean
    {
        return this._isInitialized;
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniView.as::get currentPageItems()
    get currentPageItems(): GroupItem[] | null
    {
        return this._grid ? this._grid.currentPageItems : null;
    }

    get grid(): FurniGridView | null
    {
        return this._grid;
    }

    dispose(): void
    {
        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniView.as::getWindowContainer()
    getWindowContainer(): IWindowContainer | null
    {
        if(!this._isInitialized)
        {
            this.init();
        }

        if(!this._window || this._window.disposed) return null;

        this.updateActionButtons(false);

        return this._window;
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniView.as::setViewToState()
    setViewToState(): void
    {
        let state: number;

        if(!this._model.isListInited())
        {
            state = STATE_INITIALIZING;
        }
        else if(!this._model.furniData || this._model.furniData.length === 0)
        {
            state = STATE_EMPTY;
        }
        else
        {
            state = STATE_CONTENT;
        }

        if(this._state === state) return;

        this._state = state;
        this.updateContainerVisibility();
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniView.as::clearViews()
    clearViews(): void
    {
        this.updateActionView();
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniView.as::getFirstThumb()
    getFirstThumb(): unknown
    {
        return this._grid ? this._grid.getFirstThumb() : null;
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniView.as::addItems()
    addItems(items: GroupItem[]): void
    {
        this._grid?.setItems(items);
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniView.as::updateGridFilters()
    updateGridFilters(): void
    {
        if(!this._window || this._window.disposed) return;

        const wallFloorFilter = this._window.findChildByName('filter.options') as IDropMenuWindow | null;
        const placementFilter = this._window.findChildByName('placement.options') as IDropMenuWindow | null;
        const searchField = this._window.findChildByName('filter') as ITextFieldWindow | null;

        if(!wallFloorFilter || !placementFilter || !this._grid) return;

        this._grid.setFilter(
            wallFloorFilter.selection,
            wallFloorFilter.enumerateSelection()[wallFloorFilter.selection] ?? '',
            this._model.showingRentedFurni,
            this._model.controller.mergeRentFurni,
            searchField?.text ?? '',
            placementFilter.selection,
            this._model.showingNfts
        );
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniView.as::resetFilters()
    resetFilters(category: string): void
    {
        if(!this._window) return;

        const wallFloorFilter = this._window.findChildByName('filter.options') as IDropMenuWindow | null;
        const placementFilter = this._window.findChildByName('placement.options') as IDropMenuWindow | null;

        if(wallFloorFilter) wallFloorFilter.selection = 0;

        if(placementFilter)
        {
            switch(category)
            {
                case 'furni':
                    placementFilter.selection = placementFilter.numMenuItems > 2 ? 2 : 0;
                    placementFilter.disable();
                    break;
                case 'rentables':
                    placementFilter.selection = this._rentablesPlacementSelection;
                    placementFilter.enable();
                    break;
            }
        }

        if(this._currentFilterCategory !== category)
        {
            const searchField = this._window.findChildByName('filter') as ITextFieldWindow | null;
            const clearButton = this._window.findChildByName('clear_filter_button');

            if(searchField) searchField.text = '';

            if(clearButton) clearButton.visible = false;
        }

        this._currentFilterCategory = category;
        this.updateGridFilters();
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniView.as::updateRentedItem()
    updateRentedItem(): void
    {
        const groupItem = this._model.getSelectedItem();
        const item = groupItem?.peek() ?? null;

        if(!item || !item.isRented) return;

        const extraText = this._window?.findChildByName('furni_extra') as ITextWindow | null;

        if(!extraText) return;

        extraText.visible = true;

        if(item.hasRentPeriodStarted)
        {
            this._model.localization.getLocalizationWithParams(
                'inventory.rent.expiration', undefined, String(item.secondsToExpiration)
            );
            extraText.text = this._model.localization.getLocalizationWithParams(
                'inventory.rent.expiration', undefined, String(item.secondsToExpiration)
            );
        }
        else
        {
            extraText.text = this._model.localization.getLocalizationWithParams(
                'inventory.rent.inactive', undefined, String(item.secondsToExpiration)
            );
        }
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniView.as::updateActionView()
    // TODO(AS3): skips the RoomPreviewer panel (unique/rarity preview overlay,
    // 3D object preview) — see the class doc comment. Keeps selection-driven
    // button availability and the name/description captions.
    // TODO(AS3): skips the unique/rarity item overlay widgets in the big
    // preview panel (unique_limited_item_overlay_widget/rarity_item_overlay_widget)
    // — the grid thumbnail already shows these (see GroupItem.updateItemImageVisual()).
    updateActionView(): void
    {
        if(!this._window || this._window.disposed) return;

        this.updateContainerVisibility();

        const groupItem = this._model.getSelectedItem();
        let item: FurnitureItem | null = null;
        let hasSelection = false;

        if(groupItem !== null && groupItem.peek() !== null)
        {
            item = groupItem.selectedItemIndex >= 0 ? groupItem.getAt(groupItem.selectedItemIndex) : null;

            if(!item) item = groupItem.peek();

            if(!item) return;

            hasSelection = true;

            const previewWidget = this._window.findChildByName('furni_preview_widget');

            if(previewWidget) previewWidget.visible = true;

            // AS3: sources/win63_client/com/sulake/habbo/inventory/furni/FurniView.as::updateActionView()
            // nextItemButton/viewItemButton only apply to "external image" wall items
            // (photo/moodlight-style frames with cyclable custom images) — hidden for
            // every other item. Previously never set, so they always showed.
            const wallItemType = this._model.roomEngine.getWallItemType(item.type);
            const isExternalImageWallItem = wallItemType !== null && wallItemType.indexOf('external_image_wallitem') !== -1;
            const viewItemButton = this._window.findChildByName('viewItemButton');
            const nextItemButton = this._window.findChildByName('nextItemButton');

            if(viewItemButton) viewItemButton.visible = isExternalImageWallItem;
            if(nextItemButton) nextItemButton.visible = isExternalImageWallItem;

            // AS3: sources/win63_client/com/sulake/habbo/inventory/furni/FurniView.as::updateActionView()
            // Limited/rarity preview badges — same data GroupItem already shows on the
            // grid thumbnail (updateItemImageVisual()), but for the big preview panel's
            // own overlay widgets, which were never given visibility/data at all.
            const limitedOverlay = this._window.findChildByName('unique_limited_item_overlay_widget') as IWidgetWindow | null;
            const rarityOverlay = this._window.findChildByName('rarity_item_overlay_widget') as IWidgetWindow | null;

            if(limitedOverlay)
            {
                if(item.stuffData && item.stuffData.uniqueSerialNumber > 0)
                {
                    const widget = limitedOverlay.widget as ILimitedItemPreviewOverlayWidget | null;

                    if(widget)
                    {
                        widget.serialNumber = item.stuffData.uniqueSerialNumber;
                        widget.seriesSize = item.stuffData.uniqueSeriesSize;
                    }

                    limitedOverlay.visible = true;
                }
                else
                {
                    limitedOverlay.visible = false;
                }
            }

            if(rarityOverlay)
            {
                if(item.stuffData && item.stuffData.rarityLevel >= 0)
                {
                    const widget = rarityOverlay.widget as IRarityItemPreviewOverlayWidget | null;

                    if(widget) widget.rarityLevel = item.stuffData.rarityLevel;

                    rarityOverlay.visible = true;
                }
                else
                {
                    rarityOverlay.visible = false;
                }
            }

            if(this._roomPreviewer && item)
            {
                this._roomPreviewer.reset(false);
                this._roomPreviewer.updateObjectRoom(null, null, null);

                if(item.category === 2 || item.category === 3 || item.category === 4)
                {
                    this._roomPreviewer.updateRoomWallsAndFloorVisibility(true, true);
                }
                else if(groupItem.isWallItem)
                {
                    this._roomPreviewer.updateRoomWallsAndFloorVisibility(true, true);
                    this._roomPreviewer.addWallItemIntoRoom(groupItem.type, new Vector3d(90, 0, 0), item.stuffData?.getLegacyString() ?? '');
                }
                else
                {
                    this._roomPreviewer.updateRoomWallsAndFloorVisibility(false, true);
                    this._roomPreviewer.addFurnitureIntoRoom(groupItem.type, new Vector3d(90, 0, 0), groupItem.stuffData, groupItem.extra.toString());
                }
            }
        }
        else
        {
            const previewWidget = this._window.findChildByName('furni_preview_widget');

            if(previewWidget) previewWidget.visible = false;

            const viewItemButton = this._window.findChildByName('viewItemButton');
            const nextItemButton = this._window.findChildByName('nextItemButton');

            if(viewItemButton) viewItemButton.visible = false;
            if(nextItemButton) nextItemButton.visible = false;
        }

        this.updateActionButtons(hasSelection);

        const nameText = this._window.findChildByName('furni_name') as ITextWindow | null;
        const descText = this._window.findChildByName('furni_description') as ITextWindow | null;

        if(groupItem && item)
        {
            if(nameText) nameText.text = groupItem.name;

            if(descText)
            {
                const wallItemType = item ? this._model.roomEngine.getWallItemType(item.type) : null;

                descText.text = wallItemType === 'external_image_wallitem'
                    ? String(item.stuffData?.getJSONValue('m') ?? '')
                    : groupItem.description;
            }
        }
        else
        {
            if(nameText) nameText.text = '';
            if(descText) descText.text = '';
        }

        this.updateRentedItem();
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniView.as::init()
    private init(): void
    {
        this._window = this._model.controller.view.getView('furni');

        if(!this._window) return;

        this._window.enableLookupCache();
        this._window.visible = false;
        this._window.procedure = this.windowEventProc;

        const itemGrid = this._window.findChildByName('item_grid') as IItemGridWindow | null;
        const itemGridPages = this._window.findChildByName('item_grid_pages') as IItemListWindow | null;

        if(itemGridPages) itemGridPages.enableScrollByDragging = true;

        if(itemGrid) this._grid = new FurniGridView(itemGrid, itemGridPages);

        this.populateFilterOptions();

        this._actionButtonList = this._window.findChildByName('preview_element_list') as IItemListWindow | null;

        if(this._actionButtonList)
        {
            this._placeInRoomButton = this.detachActionButton('placeinroom_btn');
            this._extendRentButton = this.detachActionButton('extendrent_btn');
            this._buyRentedItemButton = this.detachActionButton('buyrenteditem_btn');
            this._gotoRoomButton = this.detachActionButton('goto_room_btn');
            this._useButton = this.detachActionButton('use_btn');
            this._offerInTradingCountButton = this.detachActionButton('offertotrade_cnt') as ITextFieldWindow | null;
            this._offerInTradingButton = this.detachActionButton('offertotrade_btn');
            this._sellButton = this.detachActionButton('sell_btn');
        }

        const previewWidget = this._window.findChildByName('furni_preview_widget') as IWidgetWindow | null;
        const roomPreviewerWidget = (previewWidget?.widget ?? null) as IRoomPreviewerWidget | null;

        this._roomPreviewer = roomPreviewerWidget?.roomPreviewer ?? null;

        this.setViewToState();

        this._isInitialized = true;
    }

    private detachActionButton(name: string): IWindow | null
    {
        if(!this._actionButtonList) return null;

        const item = this._actionButtonList.getListItemByName(name);

        if(!item) return null;

        return this._actionButtonList.removeListItem(item);
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniView.as::updateActionButtons()
    private updateActionButtons(hasSelection: boolean): void
    {
        this.removeButtons();

        const isTradingOpen = this._model.isTradingOpen;
        const groupItem = this._model.getSelectedItem();
        const item = groupItem?.peek() ?? null;

        if(!item || !this._actionButtonList) return;

        // TODO(AS3): MarketplaceModel not ported yet — sell is always unavailable.
        const canSell = false;
        const isPrivateRoomAction = this._model.isPrivateRoom && hasSelection &&
			[13, 14, 15, 16, 20].includes(item.category);

        let canPlace = true;

        if(item.isRented && item.flatId > -1)
        {
            canPlace = false;
        }

        const isInRoom = item.flatId > -1;
        const canBuyout = item.isRented && canPlace;

        this.setButtonAvailable(this._placeInRoomButton, !isTradingOpen && canPlace);
        this.setButtonAvailable(this._extendRentButton, !isTradingOpen && canBuyout);
        this.setButtonAvailable(this._buyRentedItemButton, !isTradingOpen && canBuyout);
        this.setButtonAvailable(this._gotoRoomButton, !isTradingOpen && isInRoom);
        this.setButtonAvailable(
            this._offerInTradingCountButton,
            isTradingOpen && this._model.controller.getBoolean('multi.item.trading.enabled')
        );
        this.setButtonAvailable(this._offerInTradingButton, isTradingOpen);
        this.setButtonAvailable(this._sellButton, canSell);
        this.setButtonAvailable(this._useButton, isPrivateRoomAction);

        if(hasSelection && this._model.isPrivateRoom)
        {
            this._placeInRoomButton?.enable();
        }
        else
        {
            this._placeInRoomButton?.disable();
        }

        if(hasSelection && groupItem && item && this._model.canUserOfferToTrade())
        {
            if(groupItem.getUnlockedCount() > 0 && item.tradeable)
            {
                this._offerInTradingButton?.enable();
                this._offerInTradingCountButton?.enable();
            }
            else
            {
                this._offerInTradingButton?.disable();
                this._offerInTradingCountButton?.disable();
            }
        }
        else
        {
            this._offerInTradingButton?.disable();
            this._offerInTradingCountButton?.disable();
        }
    }

    private setButtonAvailable(button: IWindow | null, available: boolean): void
    {
        if(!button || !this._actionButtonList) return;

        const existing = this._actionButtonList.getListItemByName(button.name);

        if(available && !existing)
        {
            this._actionButtonList.addListItem(button);
        }
        else if(!available && existing)
        {
            this._actionButtonList.removeListItem(button);
        }
    }

    private removeButtons(): void
    {
        if(!this._actionButtonList) return;

        for(const button of [
            this._placeInRoomButton, this._extendRentButton, this._buyRentedItemButton,
            this._gotoRoomButton, this._useButton, this._offerInTradingCountButton,
            this._offerInTradingButton, this._sellButton,
        ])
        {
            if(button) this._actionButtonList.removeListItem(button);
        }
    }

    private updateContainerVisibility(): void
    {
        if(!this._isInitialized || !this._window) return;

        const category = this._model.controller.currentCategory;

        if(category !== 'furni' && category !== 'rentables') return;

        const view = this._model.controller.view;
        const loadingContainer = view.loadingContainer;
        const emptyContainer = view.emptyContainer;
        const gridContainer = this._window.findChildByName('grid_container');
        const previewContainer = this._window.findChildByName('preview_container');
        const optionsContainer = this._window.findChildByName('options_container');

        switch(this._state)
        {
            case STATE_INITIALIZING:
                if(loadingContainer) loadingContainer.visible = true;
                if(emptyContainer) emptyContainer.visible = false;
                if(gridContainer) gridContainer.visible = false;
                if(previewContainer) previewContainer.visible = false;
                if(optionsContainer) optionsContainer.visible = false;
                break;
            case STATE_EMPTY:
                if(loadingContainer) loadingContainer.visible = false;
                if(emptyContainer) emptyContainer.visible = true;
                if(gridContainer) gridContainer.visible = false;
                if(previewContainer) previewContainer.visible = false;
                if(optionsContainer) optionsContainer.visible = false;
                break;
            case STATE_CONTENT:
                if(loadingContainer) loadingContainer.visible = false;
                if(emptyContainer) emptyContainer.visible = false;
                if(gridContainer) gridContainer.visible = true;
                if(previewContainer) previewContainer.visible = true;
                if(optionsContainer) optionsContainer.visible = true;
                break;
        }
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniView.as::windowEventProc()
    private windowEventProc = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type === WindowMouseEvent.CLICK)
        {
            switch(window.name)
            {
                case 'placeinroom_btn':
                case 'furni_preview_region':
                    if(!this._model.isTradingOpen)
                    {
                        this._model.requestSelectedFurniPlacement();
                    }

                    break;
                case 'goto_room_btn':
                    this._model.gotoRoom();
                    break;
                case 'offertotrade_btn':
                {
                    const countText = this._offerInTradingCountButton?.text ?? '1';
                    const count = Math.max(1, parseInt(countText, 10) || 1);

                    if(String(count) !== countText && this._offerInTradingCountButton)
                    {
                        this._offerInTradingCountButton.text = String(count);
                    }

                    this._model.requestSelectedFurniToTrading(count, this._offerInTradingCountButton);
                    break;
                }
                case 'sell_btn':
                    this._model.requestSelectedFurniSelling();
                    break;
                case 'use_btn':
                    this._model.showUseProductSelection();
                    break;
                case 'extendrent_btn':
                    this._model.extendRentPeriod();
                    break;
                case 'buyrenteditem_btn':
                    this._model.buyRentedItem();
                    break;
                case 'clear_filter_button':
                {
                    const searchField = this._window?.findChildByName('filter') as ITextFieldWindow | null;

                    if(searchField) searchField.text = '';

                    window.visible = false;
                    this.updateGridFilters();
                    break;
                }
                default:
                    this._model.cancelFurniInMover();
            }
        }
        else if(event.type === WindowMouseEvent.DOWN)
        {
            if(window.name === 'furni_preview_region')
            {
                const groupItem = this._model.getSelectedItem();
                const item = groupItem?.peek() ?? null;

                if(!groupItem || !item) return;

                if([2, 3, 4].includes(item.category)) return;

                if(!this._model.isTradingOpen)
                {
                    this._model.requestSelectedFurniPlacement();
                }
            }
        }
        else if(event.type === WindowKeyboardEvent.KEY_UP)
        {
            const keyboardEvent = event as WindowKeyboardEvent;

            if(window.name === 'filter')
            {
                const clearButton = this._window?.findChildByName('clear_filter_button');
                const searchField = window as unknown as ITextFieldWindow;

                if(clearButton) clearButton.visible = searchField.text.length > 0;

                if(keyboardEvent.keyCode === 13)
                {
                    this.updateGridFilters();
                }
            }
        }

        if(event.type === 'WE_SELECTED')
        {
            switch(window.name)
            {
                case 'filter.options':
                    this.updateGridFilters();
                    break;
                case 'placement.options':
                    if(this._model.controller.currentCategory === 'rentables')
                    {
                        this._rentablesPlacementSelection = (window as unknown as IDropMenuWindow).selection;
                    }

                    this.updateGridFilters();
                    break;
            }
        }
    };

    // AS3: sources/win63_version/habbo/inventory/furni/FurniView.as::populateFilterOptions()
    private populateFilterOptions(): void
    {
        if(!this._window) return;

        const wallFloorFilter = this._window.findChildByName('filter.options') as IDropMenuWindow | null;

        if(wallFloorFilter)
        {
            wallFloorFilter.populateWithStrings([
                this._model.localization.getLocalization('inventory.filter.option.everything', 'Everything'),
                this._model.localization.getLocalization('inventory.furni.tab.floor', 'Floor'),
                this._model.localization.getLocalization('inventory.furni.tab.wall', 'Wall'),
            ]);
            wallFloorFilter.selection = 0;
        }

        const placementFilter = this._window.findChildByName('placement.options') as IDropMenuWindow | null;

        if(placementFilter)
        {
            placementFilter.populateWithStrings([
                this._model.localization.getLocalization('inventory.placement.option.anywhere', 'Anywhere'),
                this._model.localization.getLocalization('inventory.placement.option.inroom', 'In room'),
                this._model.localization.getLocalization('inventory.placement.option.notinroom', 'Not in room'),
            ]);
            placementFilter.selection = 2;
            this._rentablesPlacementSelection = 2;
        }

        const searchField = this._window.findChildByName('filter') as ITextFieldWindow | null;

        if(searchField) searchField.text = '';

        const itemsShown = this._window.findChildByName('items.shown');

        if(itemsShown) itemsShown.visible = false;

        this._window.invalidate();
    }
}
