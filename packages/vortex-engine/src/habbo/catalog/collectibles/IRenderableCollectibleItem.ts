import type {IProductDisplayInfo} from '@habbo/window/widgets/IProductDisplayInfo';

/**
 * A collectible that a catalog renderer can draw: everything `IProductDisplayInfo` needs, plus how
 * many the player holds.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/IRenderableCollectibleItem.as
 */
export interface IRenderableCollectibleItem extends IProductDisplayInfo
{
    // AS3: IRenderableCollectibleItem.as::get amount()
    readonly amount: number;
}
