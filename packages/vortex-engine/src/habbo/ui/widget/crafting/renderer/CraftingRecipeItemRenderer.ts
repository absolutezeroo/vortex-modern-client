import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {CraftingWidget} from '../CraftingWidget';
import type {CraftingFurnitureItem} from '../utils/CraftingFurnitureItem';
import {FurniThumbnailRendererBase} from './FurniThumbnailRendererBase';

/**
 * One public-recipe grid item ("products"). Clicking it asks the widget to show that recipe.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/crafting/renderer/CraftingRecipeItemRenderer.as
 */
export class CraftingRecipeItemRenderer extends FurniThumbnailRendererBase
{
    // AS3: .../renderer/CraftingRecipeItemRenderer.as::CraftingRecipeItemRenderer()
    constructor(content: CraftingFurnitureItem, window: IWindowContainer, widget: CraftingWidget)
    {
        super(content, window, widget);

        this.hideItemCount();
    }

    // AS3: .../renderer/CraftingRecipeItemRenderer.as::onTriggered()
    protected override onTriggered(): void
    {
        if(!this._widget || !this.content || this._widget.craftingInProgress) return;

        this._widget.showCraftableProduct(this.content);
    }
}
