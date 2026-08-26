import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {CraftingWidget} from '../CraftingWidget';
import {CraftingFurnitureItem} from '../utils/CraftingFurnitureItem';
import type {CraftinRecipeIngredientParser} from '@habbo/communication/messages/parser/crafting/CraftinRecipeIngredientParser';
import {CraftingRecipeItemRenderer} from '../renderer/CraftingRecipeItemRenderer';
import {CraftingGridControllerBase} from './CraftingGridControllerBase';
import {CraftingViewStateEnum} from '../utils/CraftingViewStateEnum';

/**
 * Drives the public-recipe grid (`itemgrid_products`), and turns a fetched recipe's ingredient
 * list into mixer items — pulling from the owner's inventory where possible, and padding the
 * mixer with placeholder (id 0) entries for whatever is missing.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/crafting/controller/CraftingRecipeListController.as
 */
export class CraftingRecipeListController extends CraftingGridControllerBase
{
    // AS3: .../controller/CraftingRecipeListController.as::_SafeStr_7294 (the recipe currently shown)
    private _selectedProduct: CraftingFurnitureItem | null = null;

    // AS3: .../controller/CraftingRecipeListController.as::_items
    private _items: CraftingRecipeItemRenderer[] = [];

    // AS3: .../controller/CraftingRecipeListController.as::CraftingRecipeListController()
    constructor(widget: CraftingWidget)
    {
        super(widget);
    }

    // AS3: .../controller/CraftingRecipeListController.as::dispose()
    override dispose(): void
    {
        this.clearItems();
        this._selectedProduct = null;
        super.dispose();
    }

    // AS3: .../controller/CraftingRecipeListController.as::clearItems()
    clearItems(): void
    {
        for(const item of this._items) item.dispose();

        this._items.length = 0;

        this.container?.destroyGridItems();
    }

    // AS3: .../controller/CraftingRecipeListController.as::populateRecipeItems()
    populateRecipeItems(items: CraftingFurnitureItem[]): void
    {
        const container = this.container;

        if(!container) return;

        const template = this.getItemTemplate();

        if(!template) return;

        container.removeGridItems();

        for(const item of items)
        {
            if(!this._widget) break;

            const renderer = new CraftingRecipeItemRenderer(item, template.clone() as IWindowContainer, this._widget);

            if(renderer.window) container.addGridItem(renderer.window);

            this._items.push(renderer);
        }
    }

    // AS3: .../controller/CraftingRecipeListController.as::showRecipe()
    showRecipe(product: CraftingFurnitureItem, ingredients: CraftinRecipeIngredientParser[] | null): void
    {
        this._selectedProduct = product;

        if(!this._widget) return;

        if(!ingredients)
        {
            this._widget.setInfoState(CraftingViewStateEnum.RECIPE_INCOMPLETE);

            return;
        }

        this._widget.mixerCtrl?.clearItems();

        let complete = true;

        const missingNames: string[] = [];
        const sessionDataManager = this._widget.sessionDataManager;
        const inventory = this._widget.handler.container?.inventory ?? null;

        for(const ingredient of ingredients)
        {
            let isWallItem = false;
            let furnitureData = sessionDataManager?.getFloorItemDataByName(ingredient.furnitureClassName) ?? null;

            if(!furnitureData)
            {
                furnitureData = sessionDataManager?.getWallItemDataByName(ingredient.furnitureClassName) ?? null;
                isWallItem = true;

                if(!furnitureData) return;
            }

            const availableIds = inventory?.getNonRentedInventoryIds('furni', furnitureData.id, isWallItem) ?? null;

            if(!availableIds || availableIds.length < ingredient.count) complete = false;

            for(let i = 0; i < ingredient.count; i++)
            {
                const mixerItem = new CraftingFurnitureItem(null, null, furnitureData);
                let inventoryId = 0;

                if(availableIds && availableIds.length > 0)
                {
                    inventoryId = availableIds.shift() as number;
                }
                else if(missingNames.indexOf(furnitureData.localizedName) === -1)
                {
                    missingNames.push(furnitureData.localizedName);
                }

                this._widget.mixerCtrl?.addItemToMixer(mixerItem, inventoryId);
            }
        }

        if(complete)
        {
            this._widget.setInfoState(CraftingViewStateEnum.RECIPE_COMPLETE, this._selectedProduct.furnitureData);
        }
        else
        {
            this._widget.setInfoState(CraftingViewStateEnum.RECIPE_INCOMPLETE, this._selectedProduct.furnitureData, missingNames);
        }
    }

    // AS3: .../controller/CraftingRecipeListController.as::get container()
    private get container(): IItemGridWindow | null
    {
        return this.mainWindow?.findChildByName('itemgrid_products') as IItemGridWindow | null;
    }
}
