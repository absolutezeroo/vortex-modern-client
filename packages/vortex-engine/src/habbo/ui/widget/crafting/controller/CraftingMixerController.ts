import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {CraftingWidget} from '../CraftingWidget';
import type {CraftingFurnitureItem} from '../utils/CraftingFurnitureItem';
import {CraftingMixerItemRenderer} from '../renderer/CraftingMixerItemRenderer';
import {CraftingGridControllerBase} from './CraftingGridControllerBase';

/**
 * Drives the mixer grid (`itemgrid_mixer`) — the secret-recipe crafting slots.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/crafting/controller/CraftingMixerController.as
 */
export class CraftingMixerController extends CraftingGridControllerBase
{
    // AS3: .../controller/CraftingMixerController.as::MAX_ITEMS
    private static readonly MAX_ITEMS: number = 10;

    // AS3: .../controller/CraftingMixerController.as::_renderers
    private _renderers: CraftingMixerItemRenderer[] = [];

    // AS3: .../controller/CraftingMixerController.as::CraftingMixerController()
    constructor(widget: CraftingWidget)
    {
        super(widget);
    }

    // AS3: .../controller/CraftingMixerController.as::dispose()
    override dispose(): void
    {
        this.returnItemsToInventory();
        super.dispose();
    }

    // AS3: .../controller/CraftingMixerController.as::returnItemsToInventory()
    returnItemsToInventory(): void
    {
        for(const renderer of this._renderers) renderer?.returnItemToInventory();

        this._renderers.length = 0;

        this.container?.destroyGridItems();

        this._widget?.inventoryCtrl?.updateItemCounts();
    }

    // AS3: .../controller/CraftingMixerController.as::clearItems()
    clearItems(): void
    {
        this.returnItemsToInventory();
        this.container?.destroyGridItems();
    }

    // AS3: .../controller/CraftingMixerController.as::canAdd()
    canAdd(): boolean
    {
        return this._renderers.length < CraftingMixerController.MAX_ITEMS;
    }

    // AS3: .../controller/CraftingMixerController.as::addItemToMixer()
    addItemToMixer(item: CraftingFurnitureItem, inventoryId: number): boolean
    {
        const container = this.container;

        if(!container || !this._widget) return false;

        const template = this.getItemTemplate();

        if(!template) return false;

        const renderer = new CraftingMixerItemRenderer(item, template.clone() as IWindowContainer, this._widget);

        renderer.inventoryId = inventoryId;

        if(renderer.window) container.addGridItem(renderer.window);

        this._renderers.push(renderer);

        if(this._widget.inSecretRecipeMode) this._widget.mixerContentChanged(this.collectSelectedFurnitureIds());

        return true;
    }

    // AS3: .../controller/CraftingMixerController.as::removeListItem()
    removeListItem(renderer: CraftingMixerItemRenderer): void
    {
        const container = this.container;

        if(!container) return;

        const index = this._renderers.indexOf(renderer);

        if(index === -1) return;

        this._renderers.splice(index, 1);

        if(renderer.window)
        {
            container.removeGridItem(renderer.window);
            container.rebuildGridStructure();
        }

        renderer.returnItemToInventory();
        this._widget?.inventoryCtrl?.updateItemCounts();
        this._widget?.mixerContentChanged(this.collectSelectedFurnitureIds());
    }

    // AS3: .../controller/CraftingMixerController.as::collectSelectedFurnitureIds()
    collectSelectedFurnitureIds(): number[]
    {
        const result: number[] = [];

        for(const renderer of this._renderers)
        {
            if(renderer) result.push(renderer.inventoryId);
        }

        return result;
    }

    // AS3: .../controller/CraftingMixerController.as::get container()
    private get container(): IItemGridWindow | null
    {
        return this.mainWindow?.findChildByName('itemgrid_mixer') as IItemGridWindow | null;
    }
}
