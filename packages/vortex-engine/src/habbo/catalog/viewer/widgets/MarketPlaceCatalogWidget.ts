import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ISelectorWindow} from '@core/window/components/ISelectorWindow';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {IScrollableWindow} from '@core/window/components/IScrollableWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {ImageResult} from '@habbo/room/ImageResult';
import type {OrderedMap} from '@core/utils/OrderedMap';
import type {HabboCatalog} from '../../HabboCatalog';
import {HabboCatalogUtils} from '../../HabboCatalogUtils';
import type {IMarketPlace} from '../../marketplace/IMarketPlace';
import type {IMarketPlaceVisualization} from '../../marketplace/IMarketPlaceVisualization';
import type {MarketPlaceOfferData} from '../../marketplace/MarketPlaceOfferData';
import {MarketplaceChart} from '../../marketplace/MarketplaceChart';
import type {ILimitedItemGridOverlayWidget} from '@habbo/window/widgets/ILimitedItemGridOverlayWidget';
import type {ILimitedItemPreviewOverlayWidget} from '@habbo/window/widgets/ILimitedItemPreviewOverlayWidget';
import type {IRarityItemGridOverlayWidget} from '@habbo/window/widgets/IRarityItemGridOverlayWidget';
import {CatalogWidgetName} from './CatalogWidgetName';
import {CatalogWidget} from './CatalogWidget';

const STATUS_SEARCHING = 1;
const STATUS_LIST_AVAILABLE = 2;
const MAX_SEARCH_STRING_LENGTH = 40;
const MAX_PRICE_STRING_LENGTH = 10;
const USABLE_USED_TEXT_COLOR = 4291559424;
const USABLE_UNUSED_TEXT_COLOR = 4280195897;
const POPULATE_BATCH_SIZE = 5;
const POPULATE_INTERVAL_MS = 25;

/**
 * The public marketplace search/browse/buy widget.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/MarketPlaceCatalogWidget.as
 */
export class MarketPlaceCatalogWidget extends CatalogWidget implements IMarketPlaceVisualization, IGetImageListener
{
    private _sortTypes: number[] = [];

    private _detailsOffer: MarketPlaceOfferData | null = null;

    private _itemList: IItemListWindow | null = null;

    private _itemTemplate: IWindowContainer | null = null;

    private _populationTimer: ReturnType<typeof setInterval> | null = null;

    private _offers: OrderedMap<number, MarketPlaceOfferData> | null = null;

    private _populateIndex: number = 0;

    private _dontGetOffers: boolean = false;

    private _combineUniques: boolean = true;

    private get marketPlace(): IMarketPlace | null
    {
        if(this.page?.viewer?.catalog)
        {
            return (this.page.viewer.catalog as HabboCatalog).getMarketPlace();
        }

        return null;
    }

    override dispose(): void
    {
        if(this.disposed) return;

        super.dispose();
        this._detailsOffer = null;
        this._offers = null;
        this._itemList = null;

        this._itemTemplate?.dispose();
        this._itemTemplate = null;

        if(this._populationTimer !== null)
        {
            clearInterval(this._populationTimer);
            this._populationTimer = null;
        }
    }

    override init(): boolean
    {
        if(!super.init()) return false;

        if(this.marketPlace == null) return false;

        this.marketPlace.registerVisualization(this);
        this.displayMainView();

        const list = this.window.findChildByName('offer_list') as unknown as IItemListWindow | null;
        const template = list?.getListItemByName('offer_item') ?? null;

        if(list && template) this._itemTemplate = list.removeListItem(template) as unknown as IWindowContainer;

        return true;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/MarketPlaceCatalogWidget.as::listUpdatedNotify()
    listUpdatedNotify(): void
    {
        this.hideDetails();
        this.updateList();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/MarketPlaceCatalogWidget.as::removeOfferIds()
    removeOfferIds(_offerIds: number[]): void
    {
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/MarketPlaceCatalogWidget.as::updateStats()
    updateStats(): void
    {
        if(!this.marketPlace || !this.marketPlace.localization || !this.window) return;

        const stats = this.marketPlace.itemStats;

        if(!stats) return;

        const detailsContainer = this.window.findChildByName('details_container') as unknown as IWindowContainer | null;

        if(!detailsContainer || !detailsContainer.visible) return;

        const offerCountText = detailsContainer.findChildByName('offer_count');

        if(offerCountText)
        {
            this.marketPlace.localization.registerParameter('catalog.marketplace.offer_details.offer_count', 'count', stats.offerCount.toString());
            offerCountText.visible = true;
        }

        const chartSelector = detailsContainer.findChildByName('chart_selector') as unknown as ISelectorWindow | null;

        if(!chartSelector) return;

        const selected = chartSelector.getSelected();

        if(!selected) return;

        let chart: MarketplaceChart;

        switch(selected.name)
        {
            case 'price_development':
                chart = new MarketplaceChart(stats.dayOffsets, stats.averagePrices);
                break;
            case 'trade_volume':
                chart = new MarketplaceChart(stats.dayOffsets, stats.soldAmounts);
                break;
            default:
                return;
        }

        const chartBitmap = detailsContainer.findChildByName('chart_bitmap') as unknown as IBitmapWrapperWindow | null;

        if(chartBitmap)
        {
            void chart.draw(chartBitmap.width, chartBitmap.height).then((bitmap) =>
            {
                chartBitmap.bitmap = bitmap;
            });
        }

        const chartTitle = detailsContainer.findChildByName('chart_title');

        if(chartTitle)
        {
            let key: string;

            if(chart.available)
            {
                key = `catalog.marketplace.offer_details.chart_title.${selected.name}`;
                this.marketPlace.localization.registerParameter(key, 'days', stats.historyLength.toString());
            }
            else
            {
                key = 'catalog.marketplace.offer_details.chart_title.not_available';
            }

            chartTitle.caption = this.marketPlace.localization.getLocalization(key);
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/MarketPlaceCatalogWidget.as::displayMainView()
    displayMainView(): void
    {
        this._dontGetOffers = true;
        this.attachWidgetView(CatalogWidgetName.MARKET_PLACE);
        this.window.procedure = this.onWidgetEvent;
        this._itemList = this.window.findChildByName('offer_list') as unknown as IItemListWindow | null;
        this.selectSearchCategory('search_by_activity');
        this._dontGetOffers = false;
        this.doSearch();
    }

    private selectSearchCategory(name: string): void
    {
        const searchSelector = this.window.findChildByName('search_selector') as unknown as ISelectorWindow | null;

        if(!searchSelector) return;

        const selectable = searchSelector.getSelectableByName(name);

        if(!selectable) return;

        searchSelector.setSelected(selectable);

        const searchContainer = this.window.findChildByName('search_container') as unknown as IWindowContainer | null;

        if(!searchContainer) return;

        while(searchContainer.numChildren > 0)
        {
            searchContainer.removeChildAt(0);
        }

        let layoutName: string;

        switch(name)
        {
            case 'search_by_value':
                layoutName = 'marketplace_search_simple';
                this._sortTypes = [1, 2];
                break;
            case 'search_by_activity':
                layoutName = 'marketplace_search_simple';
                this._sortTypes = [3, 4, 5, 6];
                break;
            case 'search_advanced':
                layoutName = 'marketplace_search_advanced';
                this._sortTypes = [1, 2, 3, 4, 5, 6];
                break;
            default:
                return;
        }

        const searchView = this.createWindow(layoutName);

        if(searchView) searchContainer.addChild(searchView);

        this.applyCombineUniquesState();

        const sortMenu = this.window.findChildByName('sort_dropmenu') as unknown as IDropMenuWindow | null;

        if(sortMenu)
        {
            sortMenu.populate(this.getSortKeys(this._sortTypes));
            sortMenu.selection = 0;
        }
    }

    private getSortKeys(types: number[]): string[]
    {
        return types.map((type) => `\${catalog.marketplace.sort.${type}}`);
    }

    private createWindow(name: string): IWindow | null
    {
        const catalog = this.page?.viewer?.catalog;

        if(!catalog) return null;

        return catalog.utils.createWindow(name);
    }

    private updateStatusDisplay(status: number, shown: number = -1, total: number = -1): void
    {
        const localization = this.marketPlace?.localization;

        if(!localization || !this.window) return;

        const statusText = this.window.findChildByName('status_text');

        if(!statusText) return;

        let text: string;

        if(status === STATUS_SEARCHING)
        {
            text = localization.getLocalization('catalog.marketplace.searching');
        }
        else if(total > 0)
        {
            text = localization.getLocalization('catalog.marketplace.items_found').replace('%count%', total.toString());

            if(shown > 0 && shown < total)
            {
                text += `. ${localization.getLocalization('catalog.marketplace.items_shown')}.`;
                text = text.replace('%count%', shown.toString());
            }
        }
        else
        {
            text = localization.getLocalization('catalog.marketplace.no_items');
        }

        statusText.caption = text;
    }

    private updateList(): void
    {
        if(!this.marketPlace || !this.window) return;

        const offers = this.marketPlace.latestOffers();

        if(!offers) return;

        const total = this.marketPlace.totalItemsFound();

        this._offers = offers;

        if(!this._itemList) return;

        this._itemList.destroyListItems();

        if(!this._itemTemplate) return;

        const keys = offers.getKeys();

        this.updateStatusDisplay(STATUS_LIST_AVAILABLE, keys.length, total);

        if(this._populationTimer === null)
        {
            this._populationTimer = setInterval(() =>
            {
                if(this.populateList() && this._populationTimer !== null)
                {
                    clearInterval(this._populationTimer);
                    this._populationTimer = null;
                }
            }, POPULATE_INTERVAL_MS);
        }

        this._populateIndex = 0;
        this.populateList();
    }

    private populateList(): boolean
    {
        if(!this._offers) return true;

        for(let i = 0; i < POPULATE_BATCH_SIZE; i++)
        {
            if(this._populateIndex >= this._offers.length) return true;

            this.addListItem(this._offers.getWithIndex(this._populateIndex)!);
            this._populateIndex++;
        }

        return false;
    }

    private addListItem(offer: MarketPlaceOfferData): void
    {
        if(!offer || !this._itemList || !this._itemTemplate || !this.marketPlace?.localization) return;

        const item = this._itemTemplate.clone() as unknown as IWindowContainer | null;

        if(!item || item.disposed) return;

        const localization = this.marketPlace.localization;

        let text = item.findChildByName('item_name');

        if(text) text.caption = `\${${this.marketPlace.getNameLocalizationKey(offer)}}`;

        text = item.findChildByName('item_desc');

        if(text) text.caption = `\${${this.marketPlace.getDescriptionLocalizationKey(offer)}}`;

        text = item.findChildByName('item_price');

        if(text)
        {
            let priceText = localization.getLocalization('catalog.marketplace.offer.price_public_item');

            priceText = priceText.replace('%price%', offer.price.toString());
            priceText = priceText.replace('%average%', offer.averagePrice !== 0 ? offer.averagePrice.toString() : ' - ');
            text.caption = priceText;
        }

        const offerCountText = item.findChildByName('offer_count');

        if(offerCountText)
        {
            offerCountText.caption = localization.getLocalization('catalog.marketplace.offer_count').replace('%count%', offer.offerCount.toString());
        }

        const usageState = item.findChildByName('item_usage_state') as unknown as ITextWindow | null;

        if(usageState)
        {
            if(offer.isUsable)
            {
                usageState.visible = true;
                usageState.caption = localization.getLocalization(offer.isUsed ? 'catalog.marketplace.offer.used' : 'catalog.marketplace.offer.unused');
                usageState.textColor = offer.isUsed ? USABLE_USED_TEXT_COLOR : USABLE_UNUSED_TEXT_COLOR;
            }
            else
            {
                usageState.visible = false;
                usageState.caption = '';
            }
        }

        if(offer.image == null)
        {
            const imageResult = this.getFurniImageResult(offer.furniId, offer.furniType, offer.extraData);

            if(imageResult && imageResult.data)
            {
                offer.image = imageResult.data;
                offer.imageCallback = imageResult.id;
            }

            if(imageResult) item.id = imageResult.id;
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

        if(this.marketPlace.isAccountSafetyLocked())
        {
            const buyButton = item.findChildByName('buy_button');

            buyButton?.disable();
        }

        this._itemList.addListItem(item as unknown as IWindow);
        item.procedure = this.onOfferListEvent;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/MarketPlaceCatalogWidget.as::imageReady()
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

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/MarketPlaceCatalogWidget.as::imageFailed()
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

    private onOfferListEvent = (event: WindowEvent, window?: IWindow): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        if(!this.window || !this.marketPlace || !window) return;

        if(!this._itemList) return;

        const parent = window.parent;

        if(!parent) return;

        const index = this._itemList.getListItemIndex(parent);
        const offers = this.marketPlace.latestOffers();
        const offer = offers?.getValue(index) ?? null;

        if(!offer) return;

        switch(window.name)
        {
            case 'buy_button':
                this.marketPlace.buyOffer(offer.offerId);
                break;
            case 'more_button':
                this.showDetails(offer);
        }
    };

    private showDetails(offer: MarketPlaceOfferData): void
    {
        if(!offer || !this.window || !this.marketPlace) return;

        this._detailsOffer = offer;

        const localization = this.marketPlace.localization;

        if(!localization) return;

        const mainView = this.window.getChildAt(0);

        if(mainView) mainView.visible = false;

        let detailsContainer = this.window.findChildByName('details_container') as unknown as IWindowContainer | null;

        if(detailsContainer)
        {
            detailsContainer.visible = true;
        }
        else
        {
            detailsContainer = this.createWindow('marketplace_offer_details') as unknown as IWindowContainer | null;

            if(!detailsContainer) return;

            this.window.addChild(detailsContainer);
            detailsContainer.procedure = this.detailsEventHandler;
        }

        let text = detailsContainer.findChildByName('item_name');

        if(text) text.caption = `\${${this.marketPlace.getNameLocalizationKey(offer)}}`;

        text = detailsContainer.findChildByName('item_description');

        if(text) text.caption = `\${${this.marketPlace.getDescriptionLocalizationKey(offer)}}`;

        text = detailsContainer.findChildByName('item_count');

        if(text) text.visible = false;

        localization.registerParameter('catalog.marketplace.offer_details.price', 'price', offer.price.toString());
        localization.registerParameter('catalog.marketplace.offer_details.average_price', 'days', this.marketPlace.averagePricePeriod.toString());

        const averageValue = offer.averagePrice === 0 ? ' - ' : offer.averagePrice.toString();

        localization.registerParameter('catalog.marketplace.offer_details.average_price', 'average', averageValue);

        if(offer.image == null)
        {
            const result = this.getFurniImageResult(offer.furniId, offer.furniType, offer.extraData);

            if(result && result.data)
            {
                offer.image = result.data;
                offer.imageCallback = result.id;
            }
        }

        if(offer.image !== null)
        {
            const imageWindow = detailsContainer.findChildByName('item_image') as unknown as IBitmapWrapperWindow | null;

            if(imageWindow) HabboCatalogUtils.replaceCenteredImage(imageWindow, offer.image);
        }

        const chartSelector = detailsContainer.findChildByName('chart_selector') as unknown as ISelectorWindow | null;

        if(chartSelector)
        {
            const first = chartSelector.getSelectableAt(0);

            if(first) chartSelector.setSelected(first);
        }

        const chartBitmap = detailsContainer.findChildByName('chart_bitmap') as unknown as IBitmapWrapperWindow | null;

        if(chartBitmap) chartBitmap.bitmap = null;

        const uniqueOverlayContainer = detailsContainer.findChildByName('unique_item_overlay_widget') as unknown as IWidgetWindow | null;

        if(uniqueOverlayContainer)
        {
            if(offer.isUniqueLimitedItem)
            {
                const overlay = uniqueOverlayContainer.widget as ILimitedItemPreviewOverlayWidget;

                overlay.serialNumber = offer.stuffData?.uniqueSerialNumber ?? 0;
                overlay.seriesSize = offer.stuffData?.uniqueSeriesSize ?? 0;
                uniqueOverlayContainer.visible = true;
            }
            else
            {
                uniqueOverlayContainer.visible = false;
            }
        }

        const rarityOverlayContainer = detailsContainer.findChildByName('rarity_item_overlay_widget') as unknown as IWidgetWindow | null;

        if(rarityOverlayContainer)
        {
            if(offer.stuffData && offer.stuffData.rarityLevel >= 0)
            {
                const overlay = rarityOverlayContainer.widget as IRarityItemGridOverlayWidget;

                rarityOverlayContainer.visible = true;
                overlay.rarityLevel = offer.stuffData.rarityLevel;
            }
            else
            {
                rarityOverlayContainer.visible = false;
            }
        }

        if(this.marketPlace.isAccountSafetyLocked())
        {
            const buyButton = detailsContainer.findChildByName('buy_button');

            buyButton?.disable();
        }

        this.marketPlace.requestItemStats(offer);
    }

    private hideDetails(): void
    {
        if(!this.window) return;

        this._detailsOffer = null;

        const detailsContainer = this.window.findChildByName('details_container');

        if(detailsContainer) detailsContainer.visible = false;

        const mainView = this.window.getChildAt(0);

        if(mainView) mainView.visible = true;
    }

    private doSearch(): void
    {
        this.updateStatusDisplay(STATUS_SEARCHING);

        let minPrice = -1;
        let maxPrice = -1;
        let searchString = '';
        let sortType = 1;

        let field = this.window.findChildByName('min_price_input');

        if(field) minPrice = field.caption === '' ? -1 : parseInt(field.caption, 10);

        field = this.window.findChildByName('max_price_input');

        if(field) maxPrice = field.caption === '' ? -1 : parseInt(field.caption, 10);

        field = this.window.findChildByName('search_input');

        if(field) searchString = field.caption;

        const sortMenu = this.window.findChildByName('sort_dropmenu') as unknown as IDropMenuWindow | null;

        if(sortMenu && sortMenu.selection >= 0 && sortMenu.selection < this._sortTypes.length)
        {
            sortType = this._sortTypes[sortMenu.selection];
        }

        const combineUniquesCheckBox = this.getCombineUniquesCheckBox();

        if(combineUniquesCheckBox) this._combineUniques = combineUniquesCheckBox.isSelected;

        if(!this._dontGetOffers)
        {
            this.marketPlace?.requestOffers(minPrice, maxPrice, searchString, sortType, this._combineUniques);
        }
    }

    private onWidgetEvent = (event: WindowEvent, window?: IWindow): void =>
    {
        if(!event || !window || !this.marketPlace) return;

        const localization = this.marketPlace.localization;
        const searchInput = this.window.findChildByName('search_input');

        if(event.type === WindowEvent.WE_SELECTED)
        {
            switch(window.name)
            {
                case 'sort_dropmenu': {
                    const searchSelector = this.window.findChildByName('search_selector') as unknown as ISelectorWindow | null;
                    const selected = searchSelector?.getSelected();

                    if(selected && (selected.name === 'search_by_value' || selected.name === 'search_by_activity'))
                    {
                        this.doSearch();
                    }

                    break;
                }

                case 'search_by_value':
                case 'search_by_activity':
                case 'search_advanced':
                    this.selectSearchCategory(window.name);
                    break;

                case 'combine_uniques_checkbox': {
                    const checkBox = this.getCombineUniquesCheckBox();

                    this._combineUniques = checkBox != null && checkBox.isSelected;

                    if(!this._dontGetOffers) this.doSearch();
                }
            }
        }
        else if(event.type === WindowEvent.WE_UNSELECTED)
        {
            if(window.name === 'combine_uniques_checkbox')
            {
                this._combineUniques = false;

                if(!this._dontGetOffers) this.doSearch();
            }
        }
        else if(event.type === WindowMouseEvent.CLICK)
        {
            switch(window.name)
            {
                case 'search_input':
                    if(localization && searchInput && searchInput.caption === localization.getLocalization('catalog.marketplace.search_name'))
                    {
                        searchInput.caption = '';
                    }

                    break;
                case 'search_button':
                    if(localization && searchInput && searchInput.caption === localization.getLocalization('catalog.marketplace.search_name'))
                    {
                        return;
                    }

                    this.doSearch();
            }
        }
        else if(event.type === WindowEvent.WE_CHANGE)
        {
            const field = window as unknown as ITextFieldWindow;

            if(!field) return;

            let maxLength: number;

            switch(field.name)
            {
                case 'min_price_input':
                case 'max_price_input':
                    maxLength = MAX_PRICE_STRING_LENGTH;
                    break;
                case 'search_input':
                    maxLength = MAX_SEARCH_STRING_LENGTH;
                    break;
                default:
                    return;
            }

            if(field.text.length > maxLength) field.text = field.text.substring(0, maxLength);

            (field as unknown as IScrollableWindow).scrollH = 0;
        }
    };

    private getCombineUniquesCheckBox(): ISelectableWindow | null
    {
        return this.window == null ? null : this.window.findChildByName('combine_uniques_checkbox') as unknown as ISelectableWindow | null;
    }

    private applyCombineUniquesState(): void
    {
        const checkBox = this.getCombineUniquesCheckBox();

        if(checkBox) checkBox.isSelected = this._combineUniques;
    }

    private detailsEventHandler = (event: WindowEvent, window: IWindow): void =>
    {
        if(!event || !window) return;

        if(event.type === WindowMouseEvent.CLICK)
        {
            switch(window.name)
            {
                case 'back_button':
                    this.hideDetails();
                    break;
                case 'buy_button':
                    if(this._detailsOffer) this.marketPlace?.buyOffer(this._detailsOffer.offerId);
            }

            return;
        }

        if(event.type === WindowEvent.WE_SELECTED)
        {
            switch(window.name)
            {
                case 'price_development':
                case 'trade_volume':
                    this.updateStats();
            }
        }
    };
}
