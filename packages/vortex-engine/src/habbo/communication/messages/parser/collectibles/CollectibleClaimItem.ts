import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {CollectibleItem} from './CollectibleItem';

/**
 * The product a claim hands over, plus which set and collection it belongs to.
 *
 * The two extra strings are read *after* `super()`, not through `readAdditionalParams()` — so
 * unlike `CollectibleCollectionItem` this subclass appends rather than inserts. All three
 * `CollectibleItem` subclasses take a different route into the byte stream; the hook is not a
 * convention, it is one of three.
 *
 * Name DERIVED: obfuscated in every tree, named for its one accessor on `NftClaim` (`claimItem`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_4509.as
 */
export class CollectibleClaimItem extends CollectibleItem
{
    // AS3: _SafeCls_4509.as::_SafeStr_9719 (from `get setId()`)
    private declare _setId: string;

    // AS3: _SafeCls_4509.as::_SafeStr_9077 (from `get defaultCollectionName()`)
    private declare _defaultCollectionName: string;

    // AS3: _SafeCls_4509.as::_SafeCls_4509()
    constructor(wrapper: IMessageDataWrapper)
    {
        super(wrapper);

        this._setId = wrapper.readString();
        this._defaultCollectionName = wrapper.readString();
    }

    // AS3: _SafeCls_4509.as::get setId()
    get setId(): string
    {
        return this._setId;
    }

    // AS3: _SafeCls_4509.as::get defaultCollectionName()
    get defaultCollectionName(): string
    {
        return this._defaultCollectionName;
    }
}
