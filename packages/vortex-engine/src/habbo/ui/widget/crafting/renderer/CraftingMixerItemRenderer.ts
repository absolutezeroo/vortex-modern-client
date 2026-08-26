import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {CraftingWidget} from '../CraftingWidget';
import type {CraftingFurnitureItem} from '../utils/CraftingFurnitureItem';
import {FurniThumbnailRendererBase} from './FurniThumbnailRendererBase';

/**
 * One mixer-grid item. Clicking it removes it back to the inventory grid — unless it never had an
 * inventory id (`inventoryId === 0`, one of the recipe's ingredients the player does not own),
 * where it instead points the info panel at what is missing.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/crafting/renderer/CraftingMixerItemRenderer.as
 */
export class CraftingMixerItemRenderer extends FurniThumbnailRendererBase
{
    // AS3: .../renderer/CraftingMixerItemRenderer.as::_SafeStr_6923 (inventoryId)
    private _inventoryId: number = 0;

    // AS3: .../renderer/CraftingMixerItemRenderer.as::CraftingMixerItemRenderer()
    constructor(content: CraftingFurnitureItem, window: IWindowContainer, widget: CraftingWidget)
    {
        super(content, window, widget);
    }

    // AS3: .../renderer/CraftingMixerItemRenderer.as::onTriggered()
    protected override onTriggered(): void
    {
        if(!this._widget || this._widget.craftingInProgress || this._widget.inventoryDirty) return;

        if(this._inventoryId === 0)
        {
            this._widget.setInfoState(9, this.furnitureData);

            return;
        }

        if(this._widget.inSecretRecipeMode) this._widget.mixerCtrl?.removeListItem(this);
    }

    // AS3: .../renderer/CraftingMixerItemRenderer.as::returnItemToInventory()
    returnItemToInventory(): void
    {
        if(this._inventoryId !== 0) this._content?.returnItemToInventory(this._inventoryId);

        this.dispose();
    }

    // AS3: .../renderer/CraftingMixerItemRenderer.as::updateItemCount()
    override updateItemCount(): void
    {
        this.updateBitmapBlend(this._inventoryId !== 0);
    }

    // AS3: .../renderer/CraftingMixerItemRenderer.as::get inventoryId()
    get inventoryId(): number
    {
        return this._inventoryId;
    }

    // AS3: .../renderer/CraftingMixerItemRenderer.as::set inventoryId()
    set inventoryId(value: number)
    {
        this._inventoryId = value;
        this.updateItemCount();
    }
}
