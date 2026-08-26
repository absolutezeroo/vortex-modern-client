import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {CraftingWidget} from '../CraftingWidget';
import type {CraftingFurnitureItem} from '../utils/CraftingFurnitureItem';
import {CraftingInventoryItemRenderer} from '../renderer/CraftingInventoryItemRenderer';
import {CraftingGridControllerBase} from './CraftingGridControllerBase';

/**
 * Drives the "usable inventory furniture" grid (`itemgrid_inventory`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/crafting/controller/CraftingInventoryListController.as
 */
export class CraftingInventoryListController extends CraftingGridControllerBase
{
    // AS3: .../controller/CraftingInventoryListController.as::_items
    private _items: CraftingInventoryItemRenderer[] = [];

    // AS3: .../controller/CraftingInventoryListController.as::CraftingInventoryListController()
    constructor(widget: CraftingWidget)
    {
        super(widget);
    }

    // AS3: .../controller/CraftingInventoryListController.as::dispose()
    override dispose(): void
    {
        this.clearItems();
        super.dispose();
    }

    // AS3: .../controller/CraftingInventoryListController.as::clearItems()
    clearItems(): void
    {
        for(const item of this._items) item.dispose();

        this._items.length = 0;

        this.container?.destroyGridItems();
    }

    // AS3: .../controller/CraftingInventoryListController.as::populateInventoryItems()
    populateInventoryItems(items: CraftingFurnitureItem[]): void
    {
        const container = this.container;

        if(!container) return;

        const template = this.getItemTemplate();

        if(!template) return;

        container.removeGridItems();

        for(const item of items)
        {
            if(!this._widget) break;

            const renderer = new CraftingInventoryItemRenderer(item, template.clone() as IWindowContainer, this._widget);

            if(renderer.window) container.addGridItem(renderer.window);

            this._items.push(renderer);
        }
    }

    // AS3: .../controller/CraftingInventoryListController.as::updateItemCounts()
    updateItemCounts(): void
    {
        for(const item of this._items) item.updateItemCount();
    }

    // AS3: .../controller/CraftingInventoryListController.as::get container()
    private get container(): IItemGridWindow | null
    {
        return this.mainWindow?.findChildByName('itemgrid_inventory') as IItemGridWindow | null;
    }
}
