import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IProductDisplayInfo} from '@habbo/window/widgets/IProductDisplayInfo';
import type {HabboCatalog} from '../../HabboCatalog';
import type {IRecycler} from '../../recycler/IRecycler';
import {DealPrizeContainer} from '../../recycler/DealPrizeContainer';
import type {PrizeContainer} from '../../recycler/PrizeContainer';
import type {PrizeLevelContainer} from '../../recycler/PrizeLevelContainer';
import {RecycleRewardDisplayWrapper} from '../../recycler/RecycleRewardDisplayWrapper';
import type {IGridItem} from '../IGridItem';
import type {IItemGrid} from '../IItemGrid';
import {CatalogWidget} from './CatalogWidget';
import {CatalogWidgetName} from './CatalogWidgetName';

const STAR_LEVELS = ['bronze', 'silver', 'gold', 'diamond', 'ruby', 'pink', 'green', 'grey'];

/**
 * Recycler prize table widget: browsable star-tier grids of everything the recycler can award.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/RecyclerPrizesCatalogWidget.as
 */
export class RecyclerPrizesCatalogWidget extends CatalogWidget implements IItemGrid
{
    private _prizes: PrizeLevelContainer[] | null = null;

    private _itemList: IItemListWindow | null = null;

    private _selectedItem: IGridItem | null = null;

    private get recycler(): IRecycler | null
    {
        return (this.page?.viewer?.catalog as HabboCatalog | null)?.getRecycler() ?? null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/RecyclerPrizesCatalogWidget.as::dispose()
    override dispose(): void
    {
        super.dispose();
        this._prizes = null;
        this._itemList = null;
        this._selectedItem = null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/RecyclerPrizesCatalogWidget.as::init()
    override init(): boolean
    {
        if(!super.init()) return false;

        this.attachWidgetView(CatalogWidgetName.RECYCLER_PRIZES);
        this._itemList = this.window.findChildByName('itemList') as unknown as IItemListWindow | null;

        const prizes = this.recycler?.getPrizeTable(this.onPrizesReceived) ?? null;

        if(prizes != null) this.onPrizesReceived(prizes);

        return true;
    }

    private onPrizesReceived = (prizes: PrizeLevelContainer[]): void =>
    {
        if(prizes == null) return;

        this._prizes = prizes;
        this.populateItemGrid();

        if(this._prizes.length > 0 && this._prizes[0].prizes.length > 0)
        {
            this.select(this._prizes[0].prizes[0], false);
        }
    };

    private populateItemGrid(): void
    {
        if(this._prizes == null) return;

        for(const level of this._prizes)
        {
            this.createLevelItem(level);
        }
    }

    private createLevelItem(level: PrizeLevelContainer): void
    {
        const catalog = this.page.viewer.catalog as HabboCatalog;
        const levelItemWindow = catalog.utils.createWindow('recyclerPrizesWidgetLevelItem') as unknown as IWindowContainer | null;

        if(levelItemWindow == null || this._itemList == null) return;

        this._itemList.addListItem(levelItemWindow as unknown as IWindow);

        const levelTitle = levelItemWindow.findChildByName('level_title');

        if(levelTitle != null)
        {
            levelTitle.caption = catalog.localization?.getLocalization(`recycler.prizes.category.${level.prizeLevelId}`) ?? '';
        }

        const levelChances = levelItemWindow.findChildByName('level_chances');

        if(levelChances != null)
        {
            if(level.prizeLevelId === 1)
            {
                levelChances.visible = false;
            }
            else
            {
                levelChances.visible = true;
                levelChances.caption = catalog.localization?.getLocalizationWithParams(
                    'recycler.prizes.odds', '', 'odds', `1:${level.probabilityDenominator}`) ?? '';
            }
        }

        const splitter = levelItemWindow.findChildByName('level_splitter');

        if(splitter != null) splitter.visible = level.prizeLevelId > 1;

        const starIcon = levelItemWindow.findChildByName('star_icon') as unknown as IStaticBitmapWrapperWindow | null;

        if(starIcon != null) starIcon.assetUri = `star_small_${STAR_LEVELS[level.prizeLevelId - 1]}`;

        const itemGrid = levelItemWindow.findChildByName('itemGrid') as unknown as IItemGridWindow | null;

        if(itemGrid == null) return;

        for(const prize of level.prizes)
        {
            this.createPrizeItem(prize, itemGrid);
        }
    }

    private createPrizeItem(prize: PrizeContainer, itemGrid: IItemGridWindow): void
    {
        if(prize == null || itemGrid == null || itemGrid.disposed) return;

        const catalog = this.page.viewer.catalog as HabboCatalog;
        const gridItemWindow = catalog.utils.createWindow('gridItem') as unknown as IWindowContainer | null;

        if(gridItemWindow == null) return;

        const clubLevelIcon = gridItemWindow.findChildByName('clubLevelIcon');

        if(clubLevelIcon != null) clubLevelIcon.visible = false;

        prize.view = gridItemWindow;
        prize.grid = this;
        prize.setIcon(this.page.viewer.roomEngine as IRoomEngine | null);

        itemGrid.addGridItem(gridItemWindow as unknown as IWindow);
        itemGrid.height = itemGrid.scrollableRegion.height;

        if(prize instanceof DealPrizeContainer) itemGrid.width = itemGrid.scrollableRegion.width;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/RecyclerPrizesCatalogWidget.as::select()
    select(item: IGridItem, _selected: boolean): void
    {
        if(item == null) return;

        this._selectedItem?.deactivate();
        this._selectedItem = item;
        item.activate();

        const productView = this.window.findChildByName('productView') as unknown as IWindowContainer | null;
        const prize = item as unknown as PrizeContainer;

        if(productView != null)
        {
            this.viewProduct(productView, prize.productItemType, prize.productItemTypeId, prize.title, '');
        }
    }

    private viewProduct(productView: IWindowContainer, itemType: string, itemTypeId: number, name: string, description: string): void
    {
        const productViewer = productView.findChildByName('product_viewer') as unknown as IWidgetWindow | null;
        const widget = (productViewer?.widget ?? null) as {productInfo: IProductDisplayInfo | null} | null;

        if(widget) widget.productInfo = new RecycleRewardDisplayWrapper(itemType, itemTypeId);

        const nameField = productView.findChildByName('ctlg_product_name');

        if(nameField != null) nameField.caption = name;

        const descriptionField = productView.findChildByName('ctlg_description');

        if(descriptionField != null) descriptionField.caption = description || '';
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/RecyclerPrizesCatalogWidget.as::startDragAndDrop()
    startDragAndDrop(_item: IGridItem): boolean
    {
        return false;
    }
}
