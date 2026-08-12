import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {CollectibleCollectionItem} from './CollectibleCollectionItem';
import {CollectibleItemClaim} from './CollectibleItemClaim';

/**
 * One NFT collection: its slots, the player's progress through them, and the bonus/reward items
 * that completing it unlocks.
 *
 * More than a DTO — it carries the client-side claim state machine. `claimBonusAwaiting()` /
 * `claimRewardAwaiting()` mark a claim in flight so the button cannot be pressed twice while the
 * server answers, and `claim*Finished()` bumps the claimed count locally rather than waiting for
 * the collection to be re-sent.
 *
 * Name DERIVED: obfuscated in every tree, named for the accessor that returns a list of these
 * (`NftCollectionsMessageParser.nftCollections`); the emulator's
 * `NftCollectionsMessageComposer` @3942 agrees.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_4484.as
 */
export class NftCollection
{
    /**
     * The three collection statuses, values 0/1/2. All three are obfuscated in every tree and none
     * is referenced anywhere in the client — `status` is only ever read, never compared — so they
     * keep their values as names rather than invented ones.
     */
    // AS3: _SafeCls_4484.as::_SafeStr_11262
    public static readonly STATUS_0: number = 0;
    // AS3: _SafeCls_4484.as::_SafeStr_11691
    public static readonly STATUS_1: number = 1;
    // AS3: _SafeCls_4484.as::_SafeStr_11170
    public static readonly STATUS_2: number = 2;

    /** No claim in flight. */
    // AS3: _SafeCls_4484.as::_SafeStr_6291 (name DERIVED from its use as the claiming-state reset)
    public static readonly CLAIMING_IDLE: number = 0;
    /** A claim has been sent and the server has not answered. */
    // AS3: _SafeCls_4484.as::_SafeStr_9555 (name DERIVED from `claimRewardAwaiting()`)
    public static readonly CLAIMING_AWAITING: number = 1;

    // AS3: _SafeCls_4484.as::_items
    private _items: CollectibleCollectionItem[] = [];
    // AS3: _SafeCls_4484.as::_SafeStr_8833 (from `get collectionId()`)
    private _collectionId: string = '';
    // AS3: _SafeCls_4484.as::_SafeStr_9520 (from `get collectionName()`)
    private _collectionName: string = '';
    // AS3: _SafeCls_4484.as::_SafeStr_9297 (from `get collectionScore()`)
    private _collectionScore: number = 0;
    // AS3: _SafeCls_4484.as::_SafeStr_9523 (from `get collectionTotalScore()`)
    private _collectionTotalScore: number = 0;
    // AS3: _SafeCls_4484.as::_SafeStr_8928 (from `get collectionBoostScore()`)
    private _collectionBoostScore: number = 0;
    // AS3: _SafeCls_4484.as::_SafeStr_8434 (from `get bonusItem()`)
    private _bonusItem: CollectibleCollectionItem | null = null;
    // AS3: _SafeCls_4484.as::_SafeStr_8761 (from `get rewardItem()`)
    private _rewardItem: CollectibleCollectionItem | null = null;
    // AS3: _SafeCls_4484.as::_SafeStr_9007 (from `get releasedTime()`)
    private _releasedTime: number = 0;
    // AS3: _SafeCls_4484.as::_SafeStr_8503 (from `get snapshotTime()`)
    private _snapshotTime: number = 0;
    // AS3: _SafeCls_4484.as::_status
    private _status: number = 0;
    // AS3: _SafeCls_4484.as::_SafeStr_5515 (from `get bonusItemClaim()`)
    private _bonusItemClaim: CollectibleItemClaim | null = null;
    // AS3: _SafeCls_4484.as::_SafeStr_5492 (from `get rewardItemClaim()`)
    private _rewardItemClaim: CollectibleItemClaim | null = null;
    // AS3: _SafeCls_4484.as::_SafeStr_7013 (from `get collectedItemCount()`)
    private _collectedItemCount: number = 0;
    // AS3: _SafeCls_4484.as::_SafeStr_6101 (from `get claimingBonusStatus()`)
    private _claimingBonusStatus: number = NftCollection.CLAIMING_IDLE;
    // AS3: _SafeCls_4484.as::_SafeStr_6136 (from `get claimingRewardStatus()`)
    private _claimingRewardStatus: number = NftCollection.CLAIMING_IDLE;

    /**
     * The two claim records are read at the *end*, after the timestamps and status — not next to
     * the items they belong to — and each is present only if its item was. Both booleans therefore
     * have to be kept across half the read.
     */
    // AS3: _SafeCls_4484.as::_SafeCls_4484()
    constructor(wrapper: IMessageDataWrapper)
    {
        const itemCount = wrapper.readInt();

        this._items = [];
        this._collectedItemCount = 0;

        for(let i = 0; i < itemCount; i++)
        {
            const item = new CollectibleCollectionItem(wrapper);

            this._items.push(item);

            if(item.amount > 0) this._collectedItemCount += 1;
        }

        this._collectionId = wrapper.readString();
        this._collectionName = wrapper.readString();
        this._collectionScore = wrapper.readInt();
        this._collectionTotalScore = wrapper.readInt();
        this._collectionBoostScore = wrapper.readInt();

        const hasBonusItem = wrapper.readBoolean();

        if(hasBonusItem) this._bonusItem = new CollectibleCollectionItem(wrapper);

        const hasRewardItem = wrapper.readBoolean();

        if(hasRewardItem) this._rewardItem = new CollectibleCollectionItem(wrapper);

        this._releasedTime = wrapper.readLong();
        this._snapshotTime = wrapper.readLong();
        this._status = wrapper.readShort();

        if(hasBonusItem) this._bonusItemClaim = new CollectibleItemClaim(wrapper);

        if(hasRewardItem) this._rewardItemClaim = new CollectibleItemClaim(wrapper);
    }

    // AS3: _SafeCls_4484.as::get items()
    get items(): CollectibleCollectionItem[]
    {
        return this._items;
    }

    // AS3: _SafeCls_4484.as::get collectionId()
    get collectionId(): string
    {
        return this._collectionId;
    }

    // AS3: _SafeCls_4484.as::get collectionName()
    get collectionName(): string
    {
        return this._collectionName;
    }

    // AS3: _SafeCls_4484.as::get collectionScore()
    get collectionScore(): number
    {
        return this._collectionScore;
    }

    // AS3: _SafeCls_4484.as::get collectionTotalScore()
    get collectionTotalScore(): number
    {
        return this._collectionTotalScore;
    }

    // AS3: _SafeCls_4484.as::get collectionBoostScore()
    get collectionBoostScore(): number
    {
        return this._collectionBoostScore;
    }

    // AS3: _SafeCls_4484.as::get bonusItem()
    get bonusItem(): CollectibleCollectionItem | null
    {
        return this._bonusItem;
    }

    // AS3: _SafeCls_4484.as::get rewardItem()
    get rewardItem(): CollectibleCollectionItem | null
    {
        return this._rewardItem;
    }

    // AS3: _SafeCls_4484.as::get releasedTime()
    get releasedTime(): number
    {
        return this._releasedTime;
    }

    // AS3: _SafeCls_4484.as::get snapshotTime()
    get snapshotTime(): number
    {
        return this._snapshotTime;
    }

    // AS3: _SafeCls_4484.as::get status()
    get status(): number
    {
        return this._status;
    }

    // AS3: _SafeCls_4484.as::get bonusItemClaim()
    get bonusItemClaim(): CollectibleItemClaim | null
    {
        return this._bonusItemClaim;
    }

    // AS3: _SafeCls_4484.as::get rewardItemClaim()
    get rewardItemClaim(): CollectibleItemClaim | null
    {
        return this._rewardItemClaim;
    }

    // AS3: _SafeCls_4484.as::get collectedItemCount()
    get collectedItemCount(): number
    {
        return this._collectedItemCount;
    }

    // AS3: _SafeCls_4484.as::get totalItemCount()
    get totalItemCount(): number
    {
        return this._items.length;
    }

    /**
     * AS3 divides without guarding an empty collection, and AS3 is happy to: `0 * 100 / 0` is NaN,
     * which coerces to 0 on assignment to an int. TypeScript would carry the NaN into the progress
     * bar instead, so the empty case returns 0 explicitly.
     */
    // AS3: _SafeCls_4484.as::get progressPercentage()
    get progressPercentage(): number
    {
        if(this.totalItemCount === 0) return 0;

        return Math.trunc(this.collectedItemCount * 100 / this.totalItemCount);
    }

    // AS3: _SafeCls_4484.as::get claimingBonusStatus()
    get claimingBonusStatus(): number
    {
        return this._claimingBonusStatus;
    }

    // AS3: _SafeCls_4484.as::get claimingRewardStatus()
    get claimingRewardStatus(): number
    {
        return this._claimingRewardStatus;
    }

    // AS3: _SafeCls_4484.as::claimRewardAwaiting()
    claimRewardAwaiting(): void
    {
        this._claimingRewardStatus = NftCollection.CLAIMING_AWAITING;
    }

    // AS3: _SafeCls_4484.as::claimBonusAwaiting()
    claimBonusAwaiting(): void
    {
        this._claimingBonusStatus = NftCollection.CLAIMING_AWAITING;
    }

    // AS3: _SafeCls_4484.as::claimRewardFinished()
    claimRewardFinished(success: boolean): void
    {
        this._claimingRewardStatus = NftCollection.CLAIMING_IDLE;

        // AS3 dereferences `rewardItemClaim` unguarded; it cannot be null on the success path,
        // because a claim can only succeed for an item that had one.
        if(success && this._rewardItemClaim !== null) this._rewardItemClaim.claimedAmount += 1;
    }

    // AS3: _SafeCls_4484.as::claimBonusFinished()
    claimBonusFinished(success: boolean): void
    {
        this._claimingBonusStatus = NftCollection.CLAIMING_IDLE;

        if(success && this._bonusItemClaim !== null) this._bonusItemClaim.claimedAmount += 1;
    }

    // AS3: _SafeCls_4484.as::get hasRewardItem()
    get hasRewardItem(): boolean
    {
        return this._rewardItem !== null;
    }

    // AS3: _SafeCls_4484.as::get hasBonusItem()
    get hasBonusItem(): boolean
    {
        return this._bonusItem !== null;
    }

    /**
     * Note the asymmetry against `bonusClaimed` below — it is AS3's, not a transcription slip.
     * Reward tests `claimingRewardStatus == CLAIMING_AWAITING`; bonus tests
     * `claimingBonusStatus != CLAIMING_IDLE`. With only two states the two are equivalent today,
     * and they would diverge the moment a third is added.
     */
    // AS3: _SafeCls_4484.as::get rewardClaimed()
    get rewardClaimed(): boolean
    {
        const claim = this._rewardItemClaim;

        return this.hasRewardItem
            && claim !== null
            && ((claim.claimedAmount > 0 && claim.claimedAmount >= claim.claimLimit)
                || this._claimingRewardStatus === NftCollection.CLAIMING_AWAITING);
    }

    // AS3: _SafeCls_4484.as::get bonusClaimed()
    get bonusClaimed(): boolean
    {
        const claim = this._bonusItemClaim;

        return this.hasBonusItem
            && claim !== null
            && ((claim.claimedAmount > 0 && claim.claimedAmount >= claim.claimLimit)
                || this._claimingBonusStatus !== NftCollection.CLAIMING_IDLE);
    }

    // AS3: _SafeCls_4484.as::get canClaimReward()
    get canClaimReward(): boolean
    {
        const claim = this._rewardItemClaim;

        return this.hasRewardItem
            && claim !== null
            && claim.status === CollectibleItemClaim.STATUS_CLAIMABLE
            && !this.rewardClaimed
            && claim.claimedAmount < claim.claimLimit
            && this._claimingRewardStatus === NftCollection.CLAIMING_IDLE;
    }

    // AS3: _SafeCls_4484.as::get canClaimBonus()
    get canClaimBonus(): boolean
    {
        const claim = this._bonusItemClaim;

        return this.hasBonusItem
            && claim !== null
            && claim.status === CollectibleItemClaim.STATUS_CLAIMABLE
            && !this.bonusClaimed
            && claim.claimedAmount < claim.claimLimit
            && this._claimingBonusStatus === NftCollection.CLAIMING_IDLE;
    }

    /**
     * AS3 uses `new Date().time`, i.e. wall-clock now. Ported as `Date.now()`: the snapshot time is
     * a server-sent epoch and the comparison is against the client's own clock in both.
     */
    // AS3: _SafeCls_4484.as::isBonusSnapshotPassed()
    isBonusSnapshotPassed(): boolean
    {
        return this._snapshotTime < Date.now();
    }
}
