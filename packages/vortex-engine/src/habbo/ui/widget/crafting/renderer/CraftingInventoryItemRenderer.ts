import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {CraftingWidget} from '../CraftingWidget';
import type {CraftingFurnitureItem} from '../utils/CraftingFurnitureItem';
import {FurniThumbnailRendererBase} from './FurniThumbnailRendererBase';

/**
 * One inventory grid item: clicking it, while in secret-recipe mode with room in the mixer, moves
 * one unit into the mixer.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/crafting/renderer/CraftingInventoryItemRenderer.as
 */
export class CraftingInventoryItemRenderer extends FurniThumbnailRendererBase
{
    // AS3: .../renderer/CraftingInventoryItemRenderer.as::CraftingInventoryItemRenderer()
    constructor(content: CraftingFurnitureItem, window: IWindowContainer, widget: CraftingWidget)
    {
        super(content, window, widget);
    }

    // AS3: .../renderer/CraftingInventoryItemRenderer.as::onTriggered()
    protected override onTriggered(): void
    {
        if(!this._widget || this._widget.craftingInProgress || this._widget.inventoryDirty) return;

        if(!this._widget.mixerCtrl?.canAdd()) return;

        const inventoryId = this.content?.getItemToMixer() ?? 0;

        if(inventoryId === 0) return;

        this._widget.showSecretRecipeView();
        this._widget.mixerCtrl?.addItemToMixer(this.content as CraftingFurnitureItem, inventoryId);
        this._widget.inventoryCtrl?.updateItemCounts();
    }

    // AS3: .../renderer/CraftingInventoryItemRenderer.as::updateItemCount()
    override updateItemCount(): void
    {
        if(this.content)
        {
            this.updateGroupItemCount(this.content.countInInventory);
            this.updateBitmapBlend(this.content.countInInventory > 0);
        }
    }
}
