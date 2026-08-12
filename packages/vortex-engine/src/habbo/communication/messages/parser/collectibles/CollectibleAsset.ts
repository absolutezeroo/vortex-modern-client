import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {CollectibleItem} from './CollectibleItem';

/**
 * A collectible the player actually owns: the product, plus the id of their individual copy.
 *
 * The asset id is a **long** and it is read *before* everything the base class reads — AS3's
 * constructor assigns it and only then calls `super(param1)`.
 *
 * Name DERIVED: obfuscated in every tree, named from its one accessor (`assetId`) and its base.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2726/_SafeCls_3102.as
 */
export class CollectibleAsset extends CollectibleItem
{
    /**
     * `declare` rather than a real field, and that is what makes the constructor below legal:
     * TypeScript only forbids statements before `super()` when the derived class has field
     * initialisers to run, and a declared field emits none. It also stops the assignment being
     * clobbered after `super()` returns.
     */
    // AS3: _SafeCls_3102.as::_SafeStr_8791 (from `get assetId()`)
    private declare _assetId: number;

    /**
     * The read has to happen before `super()`, not inside `readAdditionalParams()`: that hook fires
     * three fields into the base read, which would put the asset id at the wrong offset.
     */
    // AS3: _SafeCls_3102.as::_SafeCls_3102()
    constructor(wrapper: IMessageDataWrapper)
    {
        const assetId = wrapper.readLong();

        super(wrapper);

        this._assetId = assetId;
    }

    // AS3: _SafeCls_3102.as::get assetId()
    get assetId(): number
    {
        return this._assetId;
    }
}
