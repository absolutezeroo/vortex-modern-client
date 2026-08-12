import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {CollectibleItem} from './CollectibleItem';

/**
 * One slot in a collection: the product, plus how many of it the player holds (0 = not collected).
 *
 * This is the subclass `CollectibleItem.readAdditionalParams()` exists for — the amount is read
 * *between* the score and the pet figure, not appended. Contrast `CollectibleAsset`, whose long
 * asset id comes before everything and so has to be read before `super()` instead.
 *
 * Name DERIVED: obfuscated in every tree, named for where it appears — the `items`, `bonusItem` and
 * `rewardItem` of `NftCollection`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_4507.as
 */
export class CollectibleCollectionItem extends CollectibleItem
{
    /**
     * `declare`, not a real field, and that is load-bearing. `readAdditionalParams()` is called
     * from the *base* constructor, so it runs before this class's field initialisers — an
     * `= 0` here would be emitted after `super()` returns and would silently overwrite the parsed
     * amount with zero, i.e. mark every collected item as uncollected. A declared field emits no
     * initialiser at all.
     */
    // AS3: _SafeCls_4507.as::_amount
    private declare _amount: number;

    // AS3: _SafeCls_4507.as::readAdditionalParams()
    override readAdditionalParams(wrapper: IMessageDataWrapper): void
    {
        this._amount = wrapper.readInt();
    }

    // AS3: _SafeCls_4507.as::get amount()
    get amount(): number
    {
        return this._amount;
    }
}
