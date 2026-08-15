import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {OrderedMap} from '@core/utils/OrderedMap';
import {
    ChestItemType
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/ChestItemType';
import {WiredTransactionInfo} from './WiredTransactionInfo';

/**
 * Everything behind one row of the transaction log: the summary line it was opened from, which
 * chests were involved, and the two item breakdowns.
 *
 * **The two furniture maps are keyed by object, not by id.** AS3 stores `ChestItemType -> count` in
 * a `Map`, and a `ChestItemType` carries a type id, a wall/floor flag and a poster id — so two rows
 * of the same furniture in different states stay distinct. That rules out a plain object here;
 * `OrderedMap` keeps both the object keys and AS3's insertion order, which is the order the details
 * window renders them in.
 *
 * **`isIncompleteData` is the tail and it is load-bearing.** The server truncates long breakdowns,
 * and the flag is how the window knows to show a "+N more" cell instead of silently under-reporting
 * — the count for it is `withdrawFurniCount` minus what actually arrived.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2640/WiredTransactionDetails.as
 */
export class WiredTransactionDetails
{
    // AS3: WiredTransactionDetails.as::_transactionInfo
    private _transactionInfo: WiredTransactionInfo;

    // AS3: WiredTransactionDetails.as::_SafeStr_8460 (name derived: the chest ids)
    private _chestIds: number[] = [];

    // AS3: WiredTransactionDetails.as::_SafeStr_8662 (name derived: deposited furniture)
    private _depositedFurnis: OrderedMap<ChestItemType, number> = new OrderedMap<ChestItemType, number>();

    // AS3: WiredTransactionDetails.as::_SafeStr_8739 (name derived: withdrawn furniture)
    private _withdrawnFurnis: OrderedMap<ChestItemType, number> = new OrderedMap<ChestItemType, number>();

    // AS3: WiredTransactionDetails.as::_SafeStr_10134 (name derived: the truncation flag)
    private _isIncompleteData: boolean = false;

    // AS3: WiredTransactionDetails.as::WiredTransactionDetails()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._transactionInfo = new WiredTransactionInfo(wrapper);

        let count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._chestIds.push(wrapper.readInt());
        }

        // Deposits first, withdrawals second — the two blocks are identical in shape, so reading
        // them in the wrong order does not throw, it just labels every item backwards.
        count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const itemType = ChestItemType.readFromMessage(wrapper);

            this._depositedFurnis.add(itemType, wrapper.readInt());
        }

        count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const itemType = ChestItemType.readFromMessage(wrapper);

            this._withdrawnFurnis.add(itemType, wrapper.readInt());
        }

        this._isIncompleteData = wrapper.readBoolean();
    }

    // AS3: WiredTransactionDetails.as::get transactionInfo()
    get transactionInfo(): WiredTransactionInfo
    {
        return this._transactionInfo;
    }

    // AS3: WiredTransactionDetails.as::get chestIds()
    get chestIds(): number[]
    {
        return this._chestIds;
    }

    // AS3: WiredTransactionDetails.as::get depositedFurnis()
    get depositedFurnis(): OrderedMap<ChestItemType, number>
    {
        return this._depositedFurnis;
    }

    // AS3: WiredTransactionDetails.as::get withdrawnFurnis()
    get withdrawnFurnis(): OrderedMap<ChestItemType, number>
    {
        return this._withdrawnFurnis;
    }

    // AS3: WiredTransactionDetails.as::get isIncompleteData()
    get isIncompleteData(): boolean
    {
        return this._isIncompleteData;
    }
}
