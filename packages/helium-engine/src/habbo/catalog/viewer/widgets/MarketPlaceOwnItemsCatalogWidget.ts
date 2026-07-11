import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {ImageResult} from '@habbo/room/ImageResult';
import {OrderedMap} from '@core/utils/OrderedMap';
import type {HabboCatalog} from '../../HabboCatalog';
import {HabboCatalogUtils} from '../../HabboCatalogUtils';
import type {IMarketPlace} from '../../marketplace/IMarketPlace';
import type {IMarketPlaceVisualization} from '../../marketplace/IMarketPlaceVisualization';
import type {MarketPlaceOfferData} from '../../marketplace/MarketPlaceOfferData';
import type {ILimitedItemGridOverlayWidget} from '@habbo/window/widgets/ILimitedItemGridOverlayWidget';
import type {IRarityItemGridOverlayWidget} from '@habbo/window/widgets/IRarityItemGridOverlayWidget';
import {CatalogWidgetName} from './CatalogWidgetName';
import {CatalogWidget} from './CatalogWidget';

const ITEM_POOL_MAX_SIZE = 2000;
const STATUS_SEARCHING = 1;
const STATUS_LIST_AVAILABLE = 2;
const MAX_SEARCH_STRING_LENGTH = 40;

/**
 * The "my offers" (ongoing/sold/expired) marketplace widget.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/MarketPlaceOwnItemsCatalogWidget.as
 */
export class MarketPlaceOwnItemsCatalogWidget extends CatalogWidget implements IMarketPlaceVisualization, IGetImageListener
{
    private _itemTemplates: OrderedMap<number, IWindowContainer> = new OrderedMap();

    private _itemPools: OrderedMap<number, IWindowContainer[]> = new OrderedMap();

    private _itemList: IItemListWindow | null = null;

    private _allOffers: OrderedMap<number, MarketPlaceOfferData> | null = null;

    private _offers: OrderedMap<number, MarketPlaceOfferData> | null = null;

    private _offerWindowsById: OrderedMap<number, IWindowContainer> = new OrderedMap();

    private _searchText: string = '';

    private _category: number = 1;

    private _ignoreCategorySelectionEvents: boolean = false;

    private get marketPlace(): IMarketPlace | null
    {
        if(!this.page?.viewer?.catalog) return null;

        return (this.page.viewer.catalog as HabboCatalog).getMarketPlace();
    }

    override dispose(): void
    {
        this.clearVisibleItems();

        for(const template of this._itemTemplates.values())
        {
            template?.dispose();
        }

        this._itemTemplates.dispose();

        for(const pool of this._itemPools.values())
        {
            this.disposeItemPool(pool);
        }

        this._itemPools.dispose();
        this._offerWindowsById.dispose();
        this._offers?.dispose();
        this._offers = null;
        this._allOffers = null;
        super.dispose();
    }

    override init(): boolean
    {
        if(!super.init()) return false;

        if(this.marketPlace == null) return false;

        if(this.marketPlace.windowManager == null) return false;

        this.displayMainView();

        const list = this.window.findChildByName('item_list') as unknown as IItemListWindow | null;
        const ongoing = list?.getListItemByName('ongoing_item') ?? null;
        const sold = list?.getListItemByName('sold_item') ?? null;
        const expired = list?.getListItemByName('expired_item') ?? null;

        if(list && ongoing) this._itemTemplates.add(1, list.removeListItem(ongoing) as unknown as IWindowContainer);
        if(list && sold) this._itemTemplates.add(2, list.removeListItem(sold) as unknown as IWindowContainer);
        if(list && expired) this._itemTemplates.add(3, list.removeListItem(expired) as unknown as IWindowContainer);

        const searchInput = this.window.findChildByName('search_input') as unknown as ITextFieldWindow | null;

        if(searchInput) searchInput.text = '';

        this.updateSearchUiState();
        this.populateCategoryDropMenu();
        this.marketPlace.registerVisualization(this);
        this.setSelectedCategory(1);

        return true;
    }

    private showRedeemInfo(visible: boolean): void
    {
        if(!this.window) return;

        const border = this.window.findChildByName('redeem_border') as unknown as IWindowContainer | null;

        if(border) border.visible = visible;
    }

    private updateBottomActionButtons(enabled: boolean): void
    {
        if(!this.window) return;

        const isOngoing = this._category === 1;

        const recallAllButton = this.window.findChildByName('recall_all_button');

        if(recallAllButton)
        {
            recallAllButton.visible = isOngoing;

            if(enabled && isOngoing) recallAllButton.enable();
            else recallAllButton.disable();
        }

        const markAsSeenButton = this.window.findChildByName('mark_as_seen_button');

        if(markAsSeenButton)
        {
            markAsSeenButton.visible = !isOngoing;

            if(enabled && !isOngoing) markAsSeenButton.enable();
            else markAsSeenButton.disable();
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/MarketPlaceOwnItemsCatalogWidget.as::listUpdatedNotify()
    listUpdatedNotify(): void
    {
        if(this.marketPlace == null) return;

        this._allOffers = this.marketPlace.latestOwnOffers();
        this.applySearchFilter();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/MarketPlaceOwnItemsCatalogWidget.as::removeOfferIds()
    removeOfferIds(offerIds: number[]): void
    {
        if(!this._itemList || !this._offers || offerIds == null) return;

        this._itemList.autoArrangeItems = false;

        for(const offerId of offerIds)
        {
            this._offers?.remove(offerId);

            const window = this._offerWindowsById.remove(offerId);

            if(window)
            {
                const removed = this._itemList.removeListItem(window as unknown as IWindow);

                if(removed) this.recycleItemWindow(removed as unknown as IWindowContainer);
            }
        }

        this._itemList.autoArrangeItems = true;
        this.updateListSummary();
    }

    private applySearchFilter(): void
    {
        if(!this._allOffers) return;

        this._offers?.dispose();
        this._offers = new OrderedMap<number, MarketPlaceOfferData>();

        for(const offer of this._allOffers.values())
        {
            if(this.matchesSearch(offer)) this._offers.add(offer.offerId, offer);
        }

        this.updateList(this._offers);
    }

    private updateStatusDisplay(status: number, count: number = -1): void
    {
        const localization = this.marketPlace?.localization;

        if(!localization || !this.window) return;

        const statusText = this.window.findChildByName('status_text');

        if(!statusText) return;

        let text = '';

        if(status === STATUS_SEARCHING)
        {
            text = localization.getLocalization('catalog.marketplace.searching');
        }
        else if(status === STATUS_LIST_AVAILABLE)
        {
            text = count > 0
                ? localization.getLocalization('catalog.marketplace.items_found').replace('%count%', count.toString())
                : localization.getLocalization('catalog.marketplace.no_items');
        }

        statusText.caption = text;
    }

    private updateList(offers: OrderedMap<number, MarketPlaceOfferData>): void
    {
        if(!offers || !this.marketPlace || !this.window) return;

        const localization = this.marketPlace.localization;

        if(!localization || !this._itemList) return;

        this.clearVisibleItems();

        const keys = offers.getKeys();

        if(!keys) return;

        for(const offerId of keys)
        {
            const offer = offers.getValue(offerId);

            if(!offer) continue;

            const item = this.claimItemWindow(offer.status);

            if(!item || item.disposed) continue;

            let text = item.findChildByName('item_name');

            if(text) text.caption = `\${${this.marketPlace.getNameLocalizationKey(offer)}}`;

            text = item.findChildByName('item_desc');

            if(text) text.caption = `\${${this.marketPlace.getDescriptionLocalizationKey(offer)}}`;

            const priceText = item.findChildByName('item_price');

            if(priceText)
            {
                priceText.caption = localization.getLocalization('catalog.marketplace.offer.price_own_item').replace('%price%', offer.price.toString());
            }

            if(offer.status === 1)
            {
                const timeText = item.findChildByName('item_time');

                if(timeText)
                {
                    const totalMinutes = Math.max(1, offer.timeLeftMinutes);
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes - hours * 60;
                    let time = `${minutes} ${localization.getLocalization('catalog.marketplace.offer.minutes')}`;

                    if(hours > 0) time = `${hours} ${localization.getLocalization('catalog.marketplace.offer.hours')} ${time}`;

                    timeText.caption = localization.getLocalization('catalog.marketplace.offer.time_left').replace('%time%', time);
                }
            }

            if(offer.status === 2)
            {
                const soldText = item.findChildByName('item_sold');

                if(soldText) soldText.caption = this.getStatusText(offer, 'catalog.marketplace.offer.sold', 'catalog.marketplace.offer.sold_at');
            }

            if(offer.status === 3)
            {
                const expiredText = item.findChildByName('item_expired');

                if(expiredText) expiredText.caption = this.getStatusText(offer, 'catalog.marketplace.offer.expired', 'catalog.marketplace.offer.expired_at');
            }

            if(offer.image == null)
            {
                const result = this.getFurniImageResult(offer.furniId, offer.furniType, offer.extraData);

                if(result)
                {
                    if(result.data)
                    {
                        offer.image = result.data;
                    }
                    else
                    {
                        offer.imageCallback = result.id;
                        item.id = result.id;
                    }
                }
            }

            if(offer.image !== null)
            {
                const imageWindow = item.findChildByName('item_image') as unknown as IBitmapWrapperWindow | null;

                if(imageWindow) HabboCatalogUtils.replaceCenteredImage(imageWindow, offer.image);
            }

            if(offer.isUniqueLimitedItem)
            {
                const background = item.findChildByName('unique_item_background_bitmap');
                const overlayContainer = item.findChildByName('unique_item_overlay_widget') as unknown as IWidgetWindow | null;

                if(overlayContainer)
                {
                    const overlay = overlayContainer.widget as ILimitedItemGridOverlayWidget;

                    overlay.serialNumber = offer.stuffData?.uniqueSerialNumber ?? 0;
                    overlay.animated = true;
                    overlayContainer.visible = true;
                }

                if(background) background.visible = true;
            }

            if(offer.stuffData && offer.stuffData.rarityLevel >= 0)
            {
                const rarityContainer = item.findChildByName('rarity_item_overlay_widget') as unknown as IWidgetWindow | null;

                if(rarityContainer)
                {
                    const overlay = rarityContainer.widget as IRarityItemGridOverlayWidget;

                    rarityContainer.visible = true;
                    overlay.rarityLevel = offer.stuffData.rarityLevel;
                }
            }

            this._itemList.addListItem(item as unknown as IWindow);
            this._offerWindowsById.add(offer.offerId, item);
            item.procedure = this.onGridEvent;
        }

        this.updateListSummary();
    }

    private updateListSummary(): void
    {
        if(!this.marketPlace || !this._allOffers || !this._offers || !this.window) return;

        if(!this.marketPlace.localization) return;

        this.updateStatusDisplay(STATUS_LIST_AVAILABLE, this._offers.length);
        this.showRedeemInfo(true);
        this.updateBottomActionButtons(this._allOffers.length > 0);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/MarketPlaceOwnItemsCatalogWidget.as::displayMainView()
    displayMainView(): void
    {
        this.attachWidgetView(CatalogWidgetName.MARKET_PLACE_OWN_ITEMS);
        this.window.procedure = this.onWidgetEvent;
        this._itemList = this.window.findChildByName('item_list') as unknown as IItemListWindow | null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/MarketPlaceOwnItemsCatalogWidget.as::imageReady()
    imageReady(id: number, data: ImageBitmap | null): void
    {
        if(this.disposed || !this.marketPlace || !data || !this._itemList || !this._offers) return;

        const items: IWindow[] = [];

        if(this._itemList.groupListItemsWithID(id, items))
        {
            for(const item of items)
            {
                if(item)
                {
                    const imageWindow = (item as unknown as IWindowContainer).findChildByName('item_image') as unknown as IBitmapWrapperWindow | null;

                    if(imageWindow) HabboCatalogUtils.replaceCenteredImage(imageWindow, data);

                    item.id = 0;
                }
            }
        }

        for(const offer of this._offers.values())
        {
            if(offer.imageCallback === id)
            {
                offer.imageCallback = 0;
                offer.image = data;
            }
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/MarketPlaceOwnItemsCatalogWidget.as::imageFailed()
    imageFailed(_id: number): void
    {
    }

    private getFurniImageResult(furniId: number, furniType: number, extraData: string | null = null): ImageResult | null
    {
        const roomEngine = this.page?.viewer?.roomEngine;

        if(!roomEngine) return null;

        if(furniType === 1) return roomEngine.getFurnitureIcon(furniId, this);

        if(furniType === 2) return roomEngine.getWallItemIcon(furniId, this, extraData);

        return null;
    }

    private onGridEvent = (event: WindowEvent, window?: IWindow): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        if(!this.marketPlace || !window || !this.window) return;

        if(window.name !== 'pick_button') return;

        const list = this.window.findChildByName('item_list') as unknown as IItemListWindow | null;

        if(!list || !window.parent) return;

        const index = list.getListItemIndex(window.parent);

        if(!this._offers) return;

        const offer = this._offers.getWithIndex(index);

        if(offer) this.marketPlace.redeemExpiredOffer(offer.offerId);
    };

    private onWidgetEvent = (event: WindowEvent, window?: IWindow): void =>
    {
        const target = window ?? (event.target as unknown as IWindow | null);

        if(event.type === WindowMouseEvent.CLICK)
        {
            if(!this.marketPlace || !target) return;

            if(target.name === 'search_button') this.performSearch();

            if(target.name === 'cancel_search_btn' || (target.parent != null && target.parent.name === 'cancel_search_btn'))
            {
                this.clearSearch();
            }

            if(target.name === 'recall_all_button')
            {
                this.marketPlace.windowManager?.confirm('${shop.marketplace.recall.all.button}', '${shop.marketplace.recall.all.items}', 0, this.onRecallAllConfirm);
            }

            if(target.name === 'mark_as_seen_button')
            {
                this.marketPlace.windowManager?.confirm('${shop.marketplace.mark.as.seen.button}', '${shop.marketplace.mark.as.seen.items}', 0, this.onMarkAsSeenConfirm);
            }
        }
        else if(event.type === WindowEvent.WE_CHANGE)
        {
            const field = target as unknown as ITextFieldWindow | null;

            if(!field || field.name !== 'search_input') return;

            if(field.text.length > MAX_SEARCH_STRING_LENGTH) field.text = field.text.substring(0, MAX_SEARCH_STRING_LENGTH);

            field.scrollH = 0;
            this.updateSearchUiState();
        }
        else if(event.type === WindowEvent.WE_SELECTED)
        {
            if(this._ignoreCategorySelectionEvents || !target || target.name !== 'offer_category_dropmenu') return;

            const dropMenu = target as unknown as IDropMenuWindow;
            const category = this.getCategoryForSelection(dropMenu.selection);

            if(category !== this._category) this.setSelectedCategory(category);
        }
        else if(event.type === WindowKeyboardEvent.KEY_DOWN)
        {
            if(target && target.name === 'search_input')
            {
                const keyboardEvent = event as WindowKeyboardEvent;

                if(keyboardEvent.keyCode === 13) this.performSearch();
            }
        }
    };

    private performSearch(): void
    {
        if(!this.window) return;

        const searchInput = this.window.findChildByName('search_input') as unknown as ITextFieldWindow | null;

        if(!searchInput) return;

        this._searchText = this.normalizeSearchText(searchInput.text);
        this.applySearchFilter();
    }

    private clearSearch(): void
    {
        if(!this.window) return;

        const searchInput = this.window.findChildByName('search_input') as unknown as ITextFieldWindow | null;

        if(searchInput)
        {
            searchInput.text = '';
            searchInput.scrollH = 0;
        }

        this._searchText = '';
        this.updateSearchUiState();
        this.applySearchFilter();
    }

    private matchesSearch(offer: MarketPlaceOfferData): boolean
    {
        if(this._searchText === '') return true;

        return this.getOfferSearchText(offer).indexOf(this._searchText) >= 0;
    }

    private getOfferSearchText(offer: MarketPlaceOfferData): string
    {
        if(!offer || !this.marketPlace || !this.marketPlace.localization) return '';

        const localization = this.marketPlace.localization;
        const nameKey = this.marketPlace.getNameLocalizationKey(offer);
        const descKey = this.marketPlace.getDescriptionLocalizationKey(offer);
        const name = localization.getLocalization(nameKey, '');
        const desc = localization.getLocalization(descKey, '');

        return this.normalizeSearchText(`${name} ${desc}`);
    }

    private normalizeSearchText(text: string | null): string
    {
        return text == null ? '' : text.toLowerCase();
    }

    private updateSearchUiState(): void
    {
        if(!this.window) return;

        const searchInput = this.window.findChildByName('search_input') as unknown as ITextFieldWindow | null;
        const placeholder = this.window.findChildByName('search_placeholder');
        const cancelButton = this.window.findChildByName('cancel_search_btn');
        const hasText = searchInput != null && searchInput.text.length > 0;

        if(placeholder) placeholder.visible = !hasText;
        if(cancelButton) cancelButton.visible = hasText;
    }

    private getStatusText(offer: MarketPlaceOfferData, baseKey: string, timestampKey: string): string
    {
        const localization = this.marketPlace!.localization!;
        const baseText = localization.getLocalization(baseKey, '');

        if(offer == null || isNaN(offer.statusTime) || offer.statusTime <= 0) return baseText;

        return localization.getLocalizationWithParams(timestampKey, baseText, 'timestamp', this.formatStatusTime(offer.statusTime));
    }

    private formatStatusTime(time: number): string
    {
        return new Date(time).toLocaleString();
    }

    private populateCategoryDropMenu(): void
    {
        if(!this.window || this.marketPlace == null || this.marketPlace.localization == null) return;

        const dropMenu = this.window.findChildByName('offer_category_dropmenu') as unknown as IDropMenuWindow | null;

        if(!dropMenu) return;

        const localization = this.marketPlace.localization;
        const items = [
            localization.getLocalization('shop.marketplace.own.offers.category.open', 'OPEN'),
            localization.getLocalization('shop.marketplace.own.offers.category.sold', 'SOLD'),
            localization.getLocalization('shop.marketplace.own.offers.category.expired', 'EXPIRED'),
        ];

        this._ignoreCategorySelectionEvents = true;
        dropMenu.populateWithStrings(items);
        dropMenu.selection = this.getDropMenuSelectionForCategory(this._category);
        this._ignoreCategorySelectionEvents = false;
    }

    private setSelectedCategory(category: number): void
    {
        this._category = category;

        if(this.window != null)
        {
            const dropMenu = this.window.findChildByName('offer_category_dropmenu') as unknown as IDropMenuWindow | null;

            if(dropMenu)
            {
                const selection = this.getDropMenuSelectionForCategory(category);

                if(dropMenu.selection !== selection)
                {
                    this._ignoreCategorySelectionEvents = true;
                    dropMenu.selection = selection;
                    this._ignoreCategorySelectionEvents = false;
                }
            }
        }

        this.clearCurrentOffersView();
        this.updateBottomActionButtons(false);
        this.marketPlace?.requestOwnItems(category);
    }

    private clearCurrentOffersView(): void
    {
        this.clearVisibleItems();
        this._offers?.dispose();
        this._offers = null;
        this._allOffers = null;
        this.updateStatusDisplay(STATUS_SEARCHING);
        this.showRedeemInfo(false);
    }

    private getDropMenuSelectionForCategory(category: number): number
    {
        switch(category - 2)
        {
            case 0: return 1;
            case 1: return 2;
            default: return 0;
        }
    }

    private getCategoryForSelection(selection: number): number
    {
        switch(selection - 1)
        {
            case 0: return 2;
            case 1: return 3;
            default: return 1;
        }
    }

    private clearVisibleItems(): void
    {
        if(!this._itemList) return;

        this._itemList.autoArrangeItems = false;

        while(this._itemList.numListItems > 0)
        {
            const removed = this._itemList.removeListItemAt(0);

            if(removed) this.recycleItemWindow(removed as unknown as IWindowContainer);
        }

        this._itemList.autoArrangeItems = true;
        this._offerWindowsById.reset();
    }

    private claimItemWindow(status: number): IWindowContainer | null
    {
        const pool = this.getItemPool(status);

        if(pool && pool.length > 0) return pool.pop()!;

        const template = this._itemTemplates.getValue(status);

        return template ? template.clone() as unknown as IWindowContainer : null;
    }

    private recycleItemWindow(window: IWindowContainer | null): void
    {
        if(window == null) return;

        const status = this.getStatusForWindow(window);
        const pool = this.getItemPool(status);

        if(pool == null || pool.length >= ITEM_POOL_MAX_SIZE)
        {
            window.dispose();

            return;
        }

        this.resetPooledWindow(window);
        pool.push(window);
    }

    private getItemPool(status: number): IWindowContainer[] | null
    {
        if(status < 0) return null;

        let pool = this._itemPools.getValue(status);

        if(pool == null)
        {
            pool = [];
            this._itemPools.add(status, pool);
        }

        return pool;
    }

    private disposeItemPool(pool: IWindowContainer[] | null): void
    {
        if(pool == null) return;

        for(const window of pool)
        {
            window?.dispose();
        }

        pool.length = 0;
    }

    private resetPooledWindow(window: IWindowContainer): void
    {
        window.id = 0;
        window.procedure = null;

        const imageWindow = window.findChildByName('item_image') as unknown as IBitmapWrapperWindow | null;

        if(imageWindow) imageWindow.bitmap = null;

        const background = window.findChildByName('unique_item_background_bitmap');

        if(background) background.visible = false;

        const uniqueOverlay = window.findChildByName('unique_item_overlay_widget');

        if(uniqueOverlay) uniqueOverlay.visible = false;

        const rarityOverlay = window.findChildByName('rarity_item_overlay_widget');

        if(rarityOverlay) rarityOverlay.visible = false;
    }

    private getStatusForWindow(window: IWindowContainer | null): number
    {
        if(window == null) return -1;

        switch(window.name)
        {
            case 'ongoing_item': return 1;
            case 'sold_item': return 2;
            case 'expired_item': return 3;
            default: return -1;
        }
    }

    private onRecallAllConfirm = (dialog: IDisposable, event: WindowEvent): void =>
    {
        if(!dialog) return;

        dialog.dispose();

        if(event.type !== WindowEvent.WE_OK || this.marketPlace == null) return;

        this.marketPlace.recallAllOffers();
    };

    private onMarkAsSeenConfirm = (dialog: IDisposable, event: WindowEvent): void =>
    {
        if(!dialog) return;

        dialog.dispose();

        if(event.type !== WindowEvent.WE_OK || this.marketPlace == null) return;

        this.marketPlace.clearOwnHistory(this._category);
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/MarketPlaceOwnItemsCatalogWidget.as::updateStats()
    updateStats(): void
    {
    }
}
