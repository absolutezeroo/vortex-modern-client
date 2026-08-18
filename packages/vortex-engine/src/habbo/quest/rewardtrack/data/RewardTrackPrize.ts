/**
 * RewardTrackPrize — one prize on a track, and the four questions the views ask about it.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/data/RewardTrackPrize.as
 *
 * `available` is **cached, not computed**: `refreshAvailability()` writes it, and `RewardTrack`
 * calls that for every prize whenever anything changes. The distinction matters — `available` is
 * what the wire sent until the first local change, `isAvailable()` is always live.
 */
import type {RewardTrackPrizeData} from '@habbo/communication/messages/parser/quest/RewardTrackPrizeData';
import type {RewardTrack} from './RewardTrack';

export class RewardTrackPrize
{
    // AS3: RewardTrackPrize.as::_SafeStr_4872
    private _id: string;

    // AS3: RewardTrackPrize.as::_SafeStr_6611
    private _requiredPoints: number;

    // AS3: RewardTrackPrize.as::_SafeStr_8575
    private _productItemTypeId: number;

    // AS3: RewardTrackPrize.as::_SafeStr_8800
    private _rewardTypeId: string;

    // AS3: RewardTrackPrize.as::_extraParams
    private _extraParams: string;

    // AS3: RewardTrackPrize.as::_rewardAmount
    private _rewardAmount: number;

    // AS3: RewardTrackPrize.as::_SafeStr_7937
    private _premium: boolean;

    // AS3: RewardTrackPrize.as::_SafeStr_6648
    private _available: boolean;

    // AS3: RewardTrackPrize.as::_SafeStr_6961
    private _claimed: boolean;

    // AS3: RewardTrackPrize.as::RewardTrackPrize()
    constructor(data: RewardTrackPrizeData)
    {
        this._id = data.id;
        this._requiredPoints = data.requiredPoints;
        this._productItemTypeId = data.productItemTypeId;
        this._rewardTypeId = data.rewardTypeId;
        this._extraParams = data.extraParams;
        this._rewardAmount = data.rewardAmount;
        this._premium = data.premium;
        this._available = data.available;
        this._claimed = data.claimed;
    }

    // AS3: RewardTrackPrize.as::isPremiumLocked()
    public isPremiumLocked(track: RewardTrack): boolean
    {
        return this._premium && !track.premium;
    }

    // AS3: RewardTrackPrize.as::isAvailable()
    public isAvailable(track: RewardTrack): boolean
    {
        return !this.isPremiumLocked(track) && this.hasEnoughPoints(track);
    }

    // AS3: RewardTrackPrize.as::hasEnoughPoints()
    public hasEnoughPoints(track: RewardTrack): boolean
    {
        return track.points >= this._requiredPoints;
    }

    // AS3: RewardTrackPrize.as::isClaimable()
    public isClaimable(track: RewardTrack): boolean
    {
        return this.isAvailable(track) && !this._claimed;
    }

    // AS3: RewardTrackPrize.as::refreshAvailability()
    public refreshAvailability(track: RewardTrack): void
    {
        this._available = this.isAvailable(track);
    }

    // AS3: RewardTrackPrize.as::get id()
    get id(): string
    {
        return this._id;
    }

    // AS3: RewardTrackPrize.as::get requiredPoints()
    get requiredPoints(): number
    {
        return this._requiredPoints;
    }

    // AS3: RewardTrackPrize.as::get productItemTypeId()
    get productItemTypeId(): number
    {
        return this._productItemTypeId;
    }

    // AS3: RewardTrackPrize.as::get rewardTypeId()
    get rewardTypeId(): string
    {
        return this._rewardTypeId;
    }

    // AS3: RewardTrackPrize.as::get extraParams()
    get extraParams(): string
    {
        return this._extraParams;
    }

    // AS3: RewardTrackPrize.as::get rewardAmount()
    get rewardAmount(): number
    {
        return this._rewardAmount;
    }

    // AS3: RewardTrackPrize.as::get premium()
    get premium(): boolean
    {
        return this._premium;
    }

    // AS3: RewardTrackPrize.as::get available()
    get available(): boolean
    {
        return this._available;
    }

    // AS3: RewardTrackPrize.as::get claimed()
    get claimed(): boolean
    {
        return this._claimed;
    }

    // AS3: RewardTrackPrize.as::set claimed()
    set claimed(value: boolean)
    {
        this._claimed = value;
    }
}
