import type {OrderedMap} from '@core/utils/OrderedMap';
import type {CollectibleAsset} from '@habbo/communication/messages/parser/collectibles/CollectibleAsset';

import type {IInventoryModel} from '../IInventoryModel';
import type {CollectibleGroupedItem} from './CollectibleGroupedItem';

/**
 * The collectibles (NFT) inventory tab, as the rest of the inventory sees it.
 *
 * AS3 declares no `ICollectiblesModel` — `CollectiblesModel` is referenced by its concrete type
 * from `HabboInventory`, `TradingModel` and the inventory message handler. This interface exists
 * for the same reason `IRecyclerModel` does: so `HabboInventory` can surface the model the way it
 * surfaces every other category.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/collectibles/CollectiblesModel.as
 */
export interface ICollectiblesModel extends IInventoryModel
{
    // AS3: .../CollectiblesModel.as::get items()
    readonly items: OrderedMap<number, CollectibleAsset>;

    // AS3: .../CollectiblesModel.as::get selected()
    readonly selected: CollectibleGroupedItem | null;

    // AS3: .../CollectiblesModel.as::isListInitialized()
    isListInitialized(): boolean;

    // AS3: .../CollectiblesModel.as::setListInitialized()
    setListInitialized(): void;

    // AS3: .../CollectiblesModel.as::onTradeComplete()
    onTradeComplete(): void;

    // AS3: .../CollectiblesModel.as::initCollectibles()
    initCollectibles(incoming: OrderedMap<number, CollectibleAsset>): void;

    // AS3: .../CollectiblesModel.as::requestAddTrading()
    requestAddTrading(group: CollectibleGroupedItem | null, amount: number): void;

    // AS3: .../CollectiblesModel.as::updateItemLocks()
    updateItemLocks(): void;

    // AS3: .../CollectiblesModel.as::setSelected()
    setSelected(group: CollectibleGroupedItem | null): void;

    // AS3: .../CollectiblesModel.as::requestNftAssets()
    requestNftAssets(): void;

    // AS3: .../CollectiblesModel.as::getGroupedItemById()
    getGroupedItemById(assetId: number): CollectibleGroupedItem | null;

    // AS3: .../CollectiblesModel.as::resetUnseenItems()
    resetUnseenItems(): void;

    // AS3: .../CollectiblesModel.as::isUnseen()
    isUnseen(assetId: number): boolean;
}
