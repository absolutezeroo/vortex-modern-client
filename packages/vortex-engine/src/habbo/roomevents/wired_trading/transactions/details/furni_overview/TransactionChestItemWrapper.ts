import type {IStuffData} from '@habbo/room/object/data/IStuffData';
import {EmptyStuffData} from '@habbo/room/object/data/EmptyStuffData';
import type {
    ChestItemType
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/ChestItemType';
import type {
    IChestStorageItem
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/IChestStorageItem';

/**
 * Dresses a bare `ChestItemType` up as something the chest item renderers accept.
 *
 * A transaction log carries only *types and counts* — no actual chest contents — but the icon and
 * name helpers are written against {@link IChestStorageItem}. This supplies the two fields the
 * transaction has no answer for: a fixed `specialType` of 1 and one shared empty stuff data.
 *
 * **The constant `specialType` is why LTD and rarity badges never appear here.** `specialType` 6 is
 * what makes `getChestBasedItemName()` take the poster branch, and the badge helpers key off it too
 * — a transaction row is always the plain furniture name.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/transactions/details/furni_overview/TransactionChestItemWrapper.as
 */
export class TransactionChestItemWrapper implements IChestStorageItem
{
    /**
	 * One instance for every wrapper ever made. AS3 makes it a `static const`, so the same object is
	 * handed to every renderer — nothing writes to it.
	 */
    // AS3: TransactionChestItemWrapper.as::EMPTY_STUFF_DATA
    private static readonly EMPTY_STUFF_DATA: IStuffData = new EmptyStuffData();

    // AS3: TransactionChestItemWrapper.as::_SafeStr_4778 (name derived: the wrapped item type)
    private _type: ChestItemType;

    // AS3: TransactionChestItemWrapper.as::TransactionChestItemWrapper()
    constructor(type: ChestItemType)
    {
        this._type = type;
    }

    // AS3: TransactionChestItemWrapper.as::get type()
    get type(): ChestItemType
    {
        return this._type;
    }

    // AS3: TransactionChestItemWrapper.as::get specialType()
    get specialType(): number
    {
        return 1;
    }

    // AS3: TransactionChestItemWrapper.as::get stuffData()
    get stuffData(): IStuffData
    {
        return TransactionChestItemWrapper.EMPTY_STUFF_DATA;
    }
}
