import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * The player's standing on one claimable item of a collection: how many they have taken, how many
 * they may take, and whether the claim is open at all.
 *
 * `claimedAmount` has a setter, which is unusual for a parser DTO and deliberate:
 * `NftCollection.claimRewardFinished()` bumps it locally the moment the server confirms, rather
 * than waiting for the collection to be re-sent.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/CollectibleItemClaim.as
 */
export class CollectibleItemClaim
{
    /** Claim is open. */
    // AS3: CollectibleItemClaim.as::_SafeStr_10261 (name DERIVED from the `status ==` tests in NftCollection)
    public static readonly STATUS_CLAIMABLE: number = 0;

    /**
     * The second status constant, value 1. Obfuscated in every tree and never read anywhere in the
     * client — only `STATUS_CLAIMABLE` is compared against — so it is left named by its value.
     */
    // AS3: CollectibleItemClaim.as::_SafeStr_11151
    public static readonly STATUS_1: number = 1;

    // AS3: CollectibleItemClaim.as::_SafeStr_8227 (from `get claimId()`)
    private _claimId: string = '';

    // AS3: CollectibleItemClaim.as::_SafeStr_7712 (from `get claimedAmount()`)
    private _claimedAmount: number = 0;

    // AS3: CollectibleItemClaim.as::_SafeStr_9319 (from `get claimLimit()`)
    private _claimLimit: number = 0;

    // AS3: CollectibleItemClaim.as::_status
    private _status: number = 0;

    // AS3: CollectibleItemClaim.as::CollectibleItemClaim()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._claimId = wrapper.readString();
        this._claimedAmount = wrapper.readInt();
        this._claimLimit = wrapper.readInt();
        this._status = wrapper.readShort();
    }

    // AS3: CollectibleItemClaim.as::get claimId()
    get claimId(): string
    {
        return this._claimId;
    }

    // AS3: CollectibleItemClaim.as::get claimedAmount()
    get claimedAmount(): number
    {
        return this._claimedAmount;
    }

    // AS3: CollectibleItemClaim.as::set claimedAmount()
    set claimedAmount(value: number)
    {
        this._claimedAmount = value;
    }

    // AS3: CollectibleItemClaim.as::get claimLimit()
    get claimLimit(): number
    {
        return this._claimLimit;
    }

    // AS3: CollectibleItemClaim.as::get status()
    get status(): number
    {
        return this._status;
    }
}
