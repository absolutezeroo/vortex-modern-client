import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {CollectibleClaimItem} from './CollectibleClaimItem';

/**
 * One entry in the reward-claims tab: a reward the player is entitled to, its validity window, and
 * the wallet it would be minted to.
 *
 * The four timestamps are longs (epoch millis), not the ints used for the store's start/end times.
 *
 * Name DERIVED: obfuscated in every tree, named for the accessor that returns a list of these
 * (`NftClaimsMessageParser.nftClaims`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_4483.as
 */
export class NftClaim
{
    // AS3: _SafeCls_4483.as::_SafeStr_8227 (from `get claimId()`)
    private _claimId: string = '';
    // AS3: _SafeCls_4483.as::_status
    private _status: number = 0;
    // AS3: _SafeCls_4483.as::_SafeStr_7712 (from `get claimedAmount()`)
    private _claimedAmount: number = 0;
    // AS3: _SafeCls_4483.as::_SafeStr_9319 (from `get claimLimit()`)
    private _claimLimit: number = 0;
    // AS3: _SafeCls_4483.as::_SafeStr_8863 (from `get validFrom()`)
    private _validFrom: number = 0;
    // AS3: _SafeCls_4483.as::_SafeStr_10117 (from `get validTo()`)
    private _validTo: number = 0;
    // AS3: _SafeCls_4483.as::_SafeStr_9521 (from `get createdAt()`)
    private _createdAt: number = 0;
    // AS3: _SafeCls_4483.as::_SafeStr_9996 (from `get updatedAt()`)
    private _updatedAt: number = 0;
    // AS3: _SafeCls_4483.as::_SafeStr_9049 (from `get collection()`)
    private _collection: string = '';
    // AS3: _SafeCls_4483.as::_productCode
    private _productCode: string = '';
    // AS3: _SafeCls_4483.as::_SafeStr_9819 (from `get wallet()`)
    private _wallet: string = '';
    // AS3: _SafeCls_4483.as::_SafeStr_8968 (from `get claimItem()`)
    private _claimItem: CollectibleClaimItem;

    // AS3: _SafeCls_4483.as::_SafeCls_4483()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._claimId = wrapper.readString();
        this._status = wrapper.readInt();
        this._claimedAmount = wrapper.readInt();
        this._claimLimit = wrapper.readInt();
        this._validFrom = wrapper.readLong();
        this._validTo = wrapper.readLong();
        this._createdAt = wrapper.readLong();
        this._updatedAt = wrapper.readLong();
        this._collection = wrapper.readString();
        this._productCode = wrapper.readString();
        this._wallet = wrapper.readString();
        this._claimItem = new CollectibleClaimItem(wrapper);
    }

    // AS3: _SafeCls_4483.as::get claimId()
    get claimId(): string
    {
        return this._claimId;
    }

    // AS3: _SafeCls_4483.as::get status()
    get status(): number
    {
        return this._status;
    }

    // AS3: _SafeCls_4483.as::get claimedAmount()
    get claimedAmount(): number
    {
        return this._claimedAmount;
    }

    // AS3: _SafeCls_4483.as::get claimLimit()
    get claimLimit(): number
    {
        return this._claimLimit;
    }

    // AS3: _SafeCls_4483.as::get validFrom()
    get validFrom(): number
    {
        return this._validFrom;
    }

    // AS3: _SafeCls_4483.as::get validTo()
    get validTo(): number
    {
        return this._validTo;
    }

    // AS3: _SafeCls_4483.as::get createdAt()
    get createdAt(): number
    {
        return this._createdAt;
    }

    // AS3: _SafeCls_4483.as::get updatedAt()
    get updatedAt(): number
    {
        return this._updatedAt;
    }

    // AS3: _SafeCls_4483.as::get collection()
    get collection(): string
    {
        return this._collection;
    }

    // AS3: _SafeCls_4483.as::get productCode()
    get productCode(): string
    {
        return this._productCode;
    }

    // AS3: _SafeCls_4483.as::get wallet()
    get wallet(): string
    {
        return this._wallet;
    }

    // AS3: _SafeCls_4483.as::get claimItem()
    get claimItem(): CollectibleClaimItem
    {
        return this._claimItem;
    }
}
