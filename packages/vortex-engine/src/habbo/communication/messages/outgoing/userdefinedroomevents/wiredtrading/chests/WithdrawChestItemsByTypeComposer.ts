import {MessageComposer} from '@core/communication/messages/MessageComposer';
import type {
    ChestItemType
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/ChestItemType';

/**
 * Take N of one furniture type out of a chest — header 873 in WIN63's registry
 * (`_SafeCls_2046.as::_composers[873]`).
 *
 * **The item type writes its own fields.** AS3 pushes the chest id, hands the array to
 * `ChestItemType.addToComposer()`, then pushes the amount — so the type's fields sit *between* the
 * two, and the payload is not a flat tuple. That is why this composer builds its array in the
 * constructor rather than declaring one.
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and the emulator has no
 * constant for 873. Named for its one call site,
 * `FurniChestSubController::withdrawItemsWithType()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2417/_SafeCls_2416.as
 */
export class WithdrawChestItemsByTypeComposer extends MessageComposer<unknown[]>
{
    private _data: unknown[];

    // AS3: _SafeCls_2416.as::_SafeCls_2416()
    constructor(chestId: number, itemType: ChestItemType, amount: number)
    {
        super();

        this._data = [chestId];
        itemType.addToComposer(this._data);
        this._data.push(amount);
    }

    // AS3: _SafeCls_2416.as::getMessageArray()
    getMessageArray(): unknown[]
    {
        return this._data;
    }
}
