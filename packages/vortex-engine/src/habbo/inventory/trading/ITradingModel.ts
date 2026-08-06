import type {HabboInventory} from '../HabboInventory';
import type {IStuffData} from '@habbo/room/object/data/IStuffData';

/**
 * The four members AS3's interface declares — and only those. The trade *view* reaches the model
 * through this interface (`TradingView.thumbEventProc()` takes an `ITradingModel`), which is why
 * it is this narrow: everything else the view uses, it holds a concrete `TradingModel` for.
 *
 * The port previously declared a much wider interface here (state, users, item lists, an invented
 * `ITradingUser` record). None of it came from AS3 and nothing outside the module consumed it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/trading/ITradingModel.as
 */
export interface ITradingModel
{
    // AS3: .../ITradingModel.as::requestAddItemsToTrading()
    requestAddItemsToTrading(
        itemIds: number[],
        isWallItem: boolean,
        classId: number,
        category: number,
        isGroupable: boolean,
        stuffData: IStuffData | null
    ): void;

    // AS3: .../ITradingModel.as::requestRemoveItemFromTrading()
    requestRemoveItemFromTrading(index: number): void;

    // AS3: .../ITradingModel.as::getOwnItemIdsInTrade()
    getOwnItemIdsInTrade(): number[];

    // AS3: .../ITradingModel.as::getInventory()
    getInventory(): HabboInventory | null;
}
